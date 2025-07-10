import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import PhotoGallery from './PhotoGallery';
import { supabase } from '../lib/supabase';

const FeaturedPhotos: React.FC = () => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [titleColor, setTitleColor] = useState('#fff');
  const [titleSize, setTitleSize] = useState('3rem');
  const [desc, setDesc] = useState('');
  const [featuredPhotos, setFeaturedPhotos] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['featured_title', 'featured_title_color', 'featured_title_size', 'featured_desc']);
      setTitle(data?.find((row) => row.key === 'featured_title')?.value || '');
      setTitleColor(data?.find((row) => row.key === 'featured_title_color')?.value || '#fff');
      setTitleSize(data?.find((row) => row.key === 'featured_title_size')?.value || '3rem');
      setDesc(data?.find((row) => row.key === 'featured_desc')?.value || '');
    };
    fetchSettings();
    // Charger uniquement les photos featured
    const fetchFeaturedPhotos = async () => {
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });
      setFeaturedPhotos(data || []);
    };
    fetchFeaturedPhotos();
  }, []);

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ color: titleColor, fontSize: titleSize }}
            className="font-bold mb-4"
          >
            {title || t('featured_photos')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            {desc || t('latest_work')}
          </motion.p>
        </div>

        <PhotoGallery
          photos={featuredPhotos}
          showFilters={false}
          limit={6}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            to="/gallery"
            className="inline-flex items-center space-x-2 px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-full transition-all duration-200 transform hover:scale-105"
          >
            <span>{t('view_gallery')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedPhotos;