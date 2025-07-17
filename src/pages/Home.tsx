import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import PresentationSection from '../components/PresentationSection';
import FeaturedPhotos from '../components/FeaturedPhotos';
import SocialMedia from '../components/SocialMedia';
import ContactForm from '../components/ContactForm';
import GeoBlockedMessage from '../components/GeoBlockedMessage';
import { supabase } from '../lib/supabase';
import useGeoBlock from '../hooks/useGeoBlock';
import { useFontFamily } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const [showContactForm, setShowContactForm] = useState(true);
  const { isBlocked, loadingBlock } = useGeoBlock();
  const { fontFamilyText } = useFontFamily();

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

  if (loadingBlock) return null;
  if (isBlocked) return <GeoBlockedMessage />;

  return (
    <div className={`font-${fontFamilyText}`}>
      <Hero />
      <PresentationSection />
      <FeaturedPhotos />
      <SocialMedia />
      {showContactForm && <ContactForm />}
    </div>
  );
};

export default Home;
