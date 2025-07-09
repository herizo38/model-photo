import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import ContactForm from '../components/ContactForm';
import { supabase } from '../lib/supabase';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [contactText, setContactText] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
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

        <ContactForm />
      </div>
    </div>
  );
};

export default Contact;