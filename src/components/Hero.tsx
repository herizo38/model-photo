import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import SocialMediaHero from './SocialMediaHero';
// import { Link } from 'react-router-dom';

interface HeroSlide {
  id: string;
  image_url: string;
  video_url?: string;
  title: string;
  subtitle: string;
  position: number;
}

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [showSocials, setShowSocials] = useState(true);
  const [telegramUrl, setTelegramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  useEffect(() => {
    const fetchHeroContent = async () => {
      setLoading(true);
      try {
        const { data: slidesData } = await supabase
          .from('hero_slides')
          .select('*')
          .order('position', { ascending: true });
        setSlides(slidesData || []);
        // Optionnel : tu peux stocker le titre/sous-titre dans settings ou dans la première slide
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['hero_title', 'hero_subtitle']);
        setHeroTitle(data?.find((row) => row.key === 'hero_title')?.value || '');
        setHeroSubtitle(data?.find((row) => row.key === 'hero_subtitle')?.value || '');
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
    const fetchTelegramUrl = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'telegram_url')
        .maybeSingle();
      setTelegramUrl(data?.value || '');
    };
    fetchTelegramUrl();
  }, []);

  useEffect(() => {
    const fetchTiktokUrl = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'tiktok_url')
        .maybeSingle();
      setTiktokUrl(data?.value || '');
    };
    fetchTiktokUrl();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
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

  const handleRefreshSlides = async () => {
    setLoading(true);
    try {
      const { data: slidesData } = await supabase
        .from('hero_slides')
        .select('*')
        .order('position', { ascending: true });
      setSlides(slidesData || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <motion.div
          key={slide.id || index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{
            opacity: index === currentSlide ? 1 : 0,
            scale: index === currentSlide ? 1 : 1.1,
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          {slide.video_url ? (
            <video
              src={slide.video_url}
              controls
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
              poster={slide.image_url}
              style={{ backgroundColor: "#000", height: "100%", width: "100%" }}
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image_url})` }}
            />
          )}
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

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-full transition-all duration-200 transform hover:scale-105"
              >
                {/* Icône Telegram SVG */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M21.426 2.574a2.25 2.25 0 0 0-2.3-.36L3.6 8.4a2.25 2.25 0 0 0 .2 4.24l3.86 1.13 1.13 3.86a2.25 2.25 0 0 0 4.24.2l6.186-15.526a2.25 2.25 0 0 0-.19-2.23zM9.75 15.75l-1.13-3.86 7.44-7.44-6.31 8.31 3.86 1.13-3.86 1.13z" />
                </svg>
                <span>{t('chat_telegram') || 'Chat Telegram'}</span>
              </a>
            )}
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-8 py-3 border-2 border-white hover:bg-white hover:text-black text-white font-semibold rounded-full transition-all duration-200"
              >
                {/* Icône TikTok SVG */}
                <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="w-5 h-5">
                  <path d="M168 32a8 8 0 0 1 8-8h24a8 8 0 0 1 8 8v24a56.06 56.06 0 0 0 56 56v24a8 8 0 0 1-8 8h-24a56.06 56.06 0 0 0-56-56V32zm-40 56a64 64 0 1 0 64 64h-24a40 40 0 1 1-40-40v-24z" />
                </svg>
                <span>{t('watch_tiktok') || 'Voir sur TikTok'}</span>
              </a>
            )}

          </motion.div>
          {showSocials && (
            <div className="flex justify-center gap-6 mb-8">
              <SocialMediaHero />
            </div>
          )}
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
          <h3 className="text-2xl font-bold mb-1">{slides[currentSlide]?.title}</h3>
          <p className="text-gray-300">{slides[currentSlide]?.subtitle}</p>
        </motion.div>
      </div>

      {/* Bouton de rafraîchissement manuel pour les slides (admin/dev) */}
      <button
        onClick={handleRefreshSlides}
        className="absolute top-6 right-6 z-30 px-4 py-2 bg-gold text-black rounded-lg shadow hover:bg-gold/90"
      >
        Rafraîchir les slides
      </button>
    </section>
  );
};

export default Hero;