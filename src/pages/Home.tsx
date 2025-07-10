import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import PresentationSection from '../components/PresentationSection';
import FeaturedPhotos from '../components/FeaturedPhotos';
import SocialMedia from '../components/SocialMedia';
import ContactForm from '../components/ContactForm';
import { supabase } from '../lib/supabase';

const Home: React.FC = () => {
  const [showContactForm, setShowContactForm] = useState(true);

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