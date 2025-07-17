import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import PresentationSection from '../components/PresentationSection';
import FeaturedPhotos from '../components/FeaturedPhotos';
import SocialMedia from '../components/SocialMedia';
import ContactForm from '../components/ContactForm';
import GeoBlockedMessage from '../components/GeoBlockedMessage';
import { supabase } from '../lib/supabase';

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

const Home: React.FC = () => {
  const [showContactForm, setShowContactForm] = useState(true);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkGeoBlock = async () => {
      // 1. Charger la liste des pays bloqués
      const { data, error } = await supabase
        .from('geo_block_settings')
        .select('blocked_countries')
        .limit(1)
        .single();
      if (error || !data || !Array.isArray(data.blocked_countries)) {
        setIsBlocked(false); // fallback : ne bloque pas
        setLoading(false);
        return;
      }
      const blockedCountries = data.blocked_countries;
      // 2. Vérifier le pays de l'utilisateur
      try {
        const geo = await fetch('https://ipapi.co/json/').then(res => res.json());
        if (!isMounted) return;
        if (blockedCountries.includes(geo.country_code)) {
          // Log le blocage
          await supabase.from('geo_block_logs').insert({
            country_code: geo.country_code,
            ip: geo.ip,
            blocked_at: new Date().toISOString(),
          });
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
        }
      } catch {
        setIsBlocked(false);
      } finally {
        setLoading(false);
      }
    };
    checkGeoBlock();
    return () => { isMounted = false; };
  }, []);

  // Tracking de la visite (uniquement si non bloqué)
  useEffect(() => {
    if (isBlocked === false) {
      const trackVisit = async () => {
        try {
          const geo = await fetch('https://ipapi.co/json/').then(res => res.json());
          const device = getDeviceType();
          await supabase.from('url_clicks').insert({
            ip: geo.ip,
            device,
            location_country: geo.country_name,
            location_city: geo.city,
            clicked_at: new Date().toISOString()
          });
        } catch {
          // Erreur lors du tracking de la visite
        }
      };
      trackVisit();
    }
  }, [isBlocked]);

  useEffect(() => {
    const fetchShowContactForm = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'show_contact_form')
        .maybeSingle();
      setShowContactForm(data?.value !== 'false');
    };
    fetchShowContactForm();
  }, []);

  if (loading) return null;
  if (isBlocked) return <GeoBlockedMessage />;

  return (
    <div>
      <Hero />
      <PresentationSection />
      <FeaturedPhotos />
      <SocialMedia />
      {showContactForm && <ContactForm />}
    </div>
  );
};

export default Home;
