import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import PresentationSection from '../components/PresentationSection';
import FeaturedPhotos from '../components/FeaturedPhotos';
import SocialMedia from '../components/SocialMedia';
import ContactForm from '../components/ContactForm';
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

  // Vérification géoblocage AVANT tout le reste
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
          window.location.href = 'https://www.youtube.com/watch?v=J---aiyznGQ';
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
        }
      } catch {
        // Erreur lors de la récupération de la géolocalisation
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

  // Reste du code (chargement du contenu)
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

  // Affichage : rien tant qu'on ne sait pas si bloqué ou si loading
  if (loading || isBlocked) return null;

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