import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const PresentationSection: React.FC = () => {
  const [presentation, setPresentation] = useState({
    title: '',
    titleColor: '#ffffff',
    titleSize: '3rem',
    subtitle: '',
    subtitleColor: '#d1d5db',
    subtitleSize: '1.25rem',
    description: '',
    descriptionColor: '#9ca3af',
    descriptionSize: '1rem',
    buttonText: '',
    buttonLink: '',
    buttonColor: '#d4af37',
    buttonTextColor: '#000000',
    showButton: true,
    backgroundImage: '',
    backgroundColor: '#111827',
    overlayOpacity: '0.5',
    textAlign: 'center',
    maxWidth: '4xl',
    padding: '20',
    visible: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresentationSettings = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', [
            'presentation_title', 'presentation_title_color', 'presentation_title_size',
            'presentation_subtitle', 'presentation_subtitle_color', 'presentation_subtitle_size',
            'presentation_description', 'presentation_description_color', 'presentation_description_size',
            'presentation_button_text', 'presentation_button_link', 'presentation_button_color',
            'presentation_button_text_color', 'presentation_show_button', 'presentation_background_image',
            'presentation_background_color', 'presentation_overlay_opacity', 'presentation_text_align',
            'presentation_max_width', 'presentation_padding', 'presentation_visible'
          ]);

        if (data) {
          setPresentation({
            title: data.find(row => row.key === 'presentation_title')?.value || '',
            titleColor: data.find(row => row.key === 'presentation_title_color')?.value || '#ffffff',
            titleSize: data.find(row => row.key === 'presentation_title_size')?.value || '3rem',
            subtitle: data.find(row => row.key === 'presentation_subtitle')?.value || '',
            subtitleColor: data.find(row => row.key === 'presentation_subtitle_color')?.value || '#d1d5db',
            subtitleSize: data.find(row => row.key === 'presentation_subtitle_size')?.value || '1.25rem',
            description: data.find(row => row.key === 'presentation_description')?.value || '',
            descriptionColor: data.find(row => row.key === 'presentation_description_color')?.value || '#9ca3af',
            descriptionSize: data.find(row => row.key === 'presentation_description_size')?.value || '1rem',
            buttonText: data.find(row => row.key === 'presentation_button_text')?.value || '',
            buttonLink: data.find(row => row.key === 'presentation_button_link')?.value || '',
            buttonColor: data.find(row => row.key === 'presentation_button_color')?.value || '#d4af37',
            buttonTextColor: data.find(row => row.key === 'presentation_button_text_color')?.value || '#000000',
            showButton: data.find(row => row.key === 'presentation_show_button')?.value !== 'false',
            backgroundImage: data.find(row => row.key === 'presentation_background_image')?.value || '',
            backgroundColor: data.find(row => row.key === 'presentation_background_color')?.value || '#111827',
            overlayOpacity: data.find(row => row.key === 'presentation_overlay_opacity')?.value || '0.5',
            textAlign: data.find(row => row.key === 'presentation_text_align')?.value || 'center',
            maxWidth: data.find(row => row.key === 'presentation_max_width')?.value || '4xl',
            padding: data.find(row => row.key === 'presentation_padding')?.value || '20',
            visible: data.find(row => row.key === 'presentation_visible')?.value !== 'false'
          });
        }
      } catch (error) {
        console.error('Error fetching presentation settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPresentationSettings();
  }, []);

  if (loading || !presentation.visible) {
    return null;
  }

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  };

  const textAlignClasses = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right'
  };

  return (
    <section
      className={`py-${presentation.padding} relative overflow-hidden`}
      style={{
        backgroundColor: presentation.backgroundColor,
        backgroundImage: presentation.backgroundImage ? `url(${presentation.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay */}
      {presentation.backgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${presentation.overlayOpacity})`
          }}
        />
      )}

      <div className={`${maxWidthClasses[presentation.maxWidth as keyof typeof maxWidthClasses] || 'max-w-4xl'} mx-auto px-4 sm:px-6 lg:px-8 relative z-10`}>
        <div className={textAlignClasses[presentation.textAlign as keyof typeof textAlignClasses] || 'text-center'}>
          {/* Title */}
          {presentation.title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                color: presentation.titleColor,
                fontSize: presentation.titleSize
              }}
              className="font-bold mb-6"
            >
              {presentation.title}
            </motion.h2>
          )}

          {/* Subtitle */}
          {presentation.subtitle && (
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                color: presentation.subtitleColor,
                fontSize: presentation.subtitleSize
              }}
              className="font-semibold mb-6"
            >
              {presentation.subtitle}
            </motion.h3>
          )}

          {/* Description */}
          {presentation.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 leading-relaxed text-left max-w-md mx-auto"
              style={{
                color: presentation.descriptionColor,
                fontSize: presentation.descriptionSize
              }}
            >
              {presentation.description.split(/<br\s*\/?>|\n/).map((line, idx) => {
                const [key, ...rest] = line.split(':');
                if (!rest.length) return null;
                return (
                  <div key={idx}>
                    <strong>{key.trim()} :</strong> {rest.join(':').trim()}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Button */}
          {presentation.showButton && presentation.buttonText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <a
                href={presentation.buttonLink || '#'}
                target={presentation.buttonLink?.startsWith('http') ? '_blank' : '_self'}
                rel={presentation.buttonLink?.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-block px-8 py-3 font-semibold rounded-full transition-all duration-200 transform hover:scale-105"
                style={{
                  backgroundColor: presentation.buttonColor,
                  color: presentation.buttonTextColor
                }}
              >
                {presentation.buttonText}
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PresentationSection;