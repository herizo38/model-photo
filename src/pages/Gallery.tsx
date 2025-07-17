import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import PhotoGallery from '../components/PhotoGallery';
import GeoBlockedMessage from '../components/GeoBlockedMessage';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import useGeoBlock from '../hooks/useGeoBlock';

const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryTitleColor, setGalleryTitleColor] = useState('#ffffff');
  const [galleryTitleSize, setGalleryTitleSize] = useState('4rem');
  const [galleryDesc, setGalleryDesc] = useState('');
  const [galleryDescColor, setGalleryDescColor] = useState('#d1d5db');
  const [galleryDescSize, setGalleryDescSize] = useState('1.25rem');
  const [loading, setLoading] = useState(true);
  const { isBlocked, loadingBlock } = useGeoBlock();

  useEffect(() => {
    const fetchGallerySettings = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', [
            'gallery_title', 'gallery_title_color', 'gallery_title_size',
            'gallery_desc', 'gallery_desc_color', 'gallery_desc_size'
          ]);

        if (data) {
          setGalleryTitle(data.find(row => row.key === 'gallery_title')?.value || '');
          setGalleryTitleColor(data.find(row => row.key === 'gallery_title_color')?.value || '#ffffff');
          setGalleryTitleSize(data.find(row => row.key === 'gallery_title_size')?.value || '4rem');
          setGalleryDesc(data.find(row => row.key === 'gallery_desc')?.value || '');
          setGalleryDescColor(data.find(row => row.key === 'gallery_desc_color')?.value || '#d1d5db');
          setGalleryDescSize(data.find(row => row.key === 'gallery_desc_size')?.value || '1.25rem');
        }
      } catch (error) {
        console.error('Error fetching gallery settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallerySettings();

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
            style={{
              color: galleryTitleColor,
              fontSize: galleryTitleSize
            }}
            className="font-bold mb-4"
          >
            {loading ? '...' : (galleryTitle || t('gallery'))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              color: galleryDescColor,
              fontSize: galleryDescSize
            }}
          >
            {loading ? '' : (galleryDesc || 'Explore my complete portfolio')}
          </motion.p>
        </div>

        <PhotoGallery />
      </div>
    </div>
  );
};

export default Gallery;