import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SocialMediaHero from './SocialMediaHero';

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState([
    {
      image: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Fashion Editorial',
      subtitle: 'Vogue Magazine Shoot',
    },
    {
      image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Portrait Session',
      subtitle: 'Studio Photography',
    },
    {
      image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Commercial Campaign',
      subtitle: 'Brand Collaboration',
    },
  ]);
  const [showSocials, setShowSocials] = useState(true);

  useEffect(() => {
    const fetchHeroContent = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['hero_title', 'hero_subtitle', 'hero_slides']);
        if (data) {
          setHeroTitle(data.find((row) => row.key === 'hero_title')?.value || '');
          setHeroSubtitle(data.find((row) => row.key === 'hero_subtitle')?.value || '');
          const slidesRaw = data.find((row) => row.key === 'hero_slides')?.value;
          if (slidesRaw) {
            try {
              const parsed = JSON.parse(slidesRaw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setSlides(parsed);
              }
            } catch { }
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHeroContent();
  }, []);

  useEffect(() => {
    const fetchShowSocials = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'hero_show_socials')
          .maybeSingle();
        setShowSocials(data?.value === 'false' ? false : true);
      } catch { }
    };
    fetchShowSocials();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: index === currentSlide ? 1 : 0,
            scale: index === currentSlide ? 1 : 1.1,
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-6xl md:text-8xl font-bold mb-4"
          >
            {loading ? '...' : (heroTitle || t('hero_title'))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300 mb-8"
          >
            {loading ? '' : (heroSubtitle || t('hero_subtitle'))}
          </motion.p>
          {showSocials && (
            <div className="flex justify-center gap-6 mb-8">
              <SocialMediaHero />
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-full transition-all duration-200 transform hover:scale-105">
              {t('view_gallery')}
            </button>
            <button className="flex items-center space-x-2 px-8 py-3 border-2 border-white hover:bg-white hover:text-black text-white font-semibold rounded-full transition-all duration-200">
              <Play className="w-5 h-5" />
              <span>Watch Reel</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 text-white hover:text-gold transition-colors"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 text-white hover:text-gold transition-colors"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentSlide ? 'bg-gold' : 'bg-white/50'
              }`}
          />
        ))}
      </div>

      {/* Slide Info */}
      <div className="absolute bottom-8 left-8 z-20 text-white">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold mb-1">{slides[currentSlide].title}</h3>
          <p className="text-gray-300">{slides[currentSlide].subtitle}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;