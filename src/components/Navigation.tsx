import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Camera, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [siteLogo, setSiteLogo] = useState('');
  const [siteTitle, setSiteTitle] = useState('Portfolio');
  const [navVisibility, setNavVisibility] = useState({
    home: true,
    gallery: true,
    about: true,
    contact: true,
    admin: true,
  });

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['site_logo', 'site_title']);

        if (data) {
          setSiteLogo(data.find(row => row.key === 'site_logo')?.value || '');
          setSiteTitle(data.find(row => row.key === 'site_title')?.value || 'Portfolio');
        }
      } catch (error) {
        console.error('Error fetching site info:', error);
      }
    };
    fetchSiteInfo();
  }, []);

  useEffect(() => {
    const fetchNavSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'show_nav_home',
          'show_nav_gallery',
          'show_nav_about',
          'show_nav_contact',
          'show_nav_admin',
        ]);
      setNavVisibility({
        home: data?.find(row => row.key === 'show_nav_home')?.value !== 'false',
        gallery: data?.find(row => row.key === 'show_nav_gallery')?.value !== 'false',
        about: data?.find(row => row.key === 'show_nav_about')?.value !== 'false',
        contact: data?.find(row => row.key === 'show_nav_contact')?.value !== 'false',
        admin: data?.find(row => row.key === 'show_nav_admin')?.value !== 'false',
      });
    };
    fetchNavSettings();
  }, []);

  const navItems = [
    { name: 'Accueil', href: '/' },
    { name: 'Galerie', href: '/gallery' },
    { name: 'À Propos', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Admin', href: '/admin' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {siteLogo ? (
              <img src={siteLogo} alt={siteTitle} className="w-8 h-8 object-contain" />
            ) : (
              <Camera className="w-8 h-8 text-gold" />
            )}
            <span className="text-xl font-bold text-white">{siteTitle}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${isActive(item.href)
                  ? 'text-gold'
                  : 'text-white hover:text-gold'
                  }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              {/* <Globe className="w-4 h-4 text-white" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-white text-sm border-none focus:outline-none"
              >
                <option value="en" className="bg-black">EN</option>
                <option value="fr" className="bg-black">FR</option>
              </select> */}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-gold transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.length > 0 ? (
                navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block text-lg font-medium transition-colors duration-200 ${isActive(item.href)
                      ? 'text-gold'
                      : 'text-white hover:text-gold'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))
              ) : null}
              {/* Mobile Language Switcher uniquement si aucun menu */}
              {navItems.length === 0 && (
                <div className="flex items-center space-x-2 pt-4 border-t border-white/10">
                  <Globe className="w-4 h-4 text-white" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-white text-sm border-none focus:outline-none"
                  >
                    <option value="en" className="bg-black">English</option>
                    <option value="fr" className="bg-black">Français</option>
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;