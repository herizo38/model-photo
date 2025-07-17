import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage, useFontFamily } from '../contexts/LanguageContext';
import ContactForm from '../components/ContactForm';
import { supabase } from '../lib/supabase';
import GeoBlockedMessage from '../components/GeoBlockedMessage';
import useGeoBlock from '../hooks/useGeoBlock';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const { fontFamilyTitle } = useFontFamily();
  const [contactText, setContactText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(true);
  const { isBlocked, loadingBlock } = useGeoBlock();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'contact_text')
          .single();
        setContactText(data?.value || '');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

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
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-4xl md:text-6xl font-bold text-white mb-4 font-${fontFamilyTitle}`}
          >
            {t('contact')}
          </motion.h1>
          {loading ? (
            <div className="text-gray-400">Chargement...</div>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-300 whitespace-pre-line"
            >
              {contactText || 'Prêt à créer quelque chose d’exceptionnel ensemble ?'}
            </motion.p>
          )}
        </div>

        {showContactForm && <ContactForm />}
      </div>
    </div>
  );
};

export default Contact;