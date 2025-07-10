import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateText } from '../lib/translate';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  autoTranslate: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    home: 'Home',
    gallery: 'Gallery',
    about: 'About',
    contact: 'Contact',
    admin: 'Admin',

    // Homepage
    hero_title: 'Professional Model',
    hero_subtitle: 'Capturing moments, creating art',
    featured_photos: 'Featured Photos',
    latest_work: 'Latest Work',
    view_gallery: 'View Gallery',

    // Gallery
    all_categories: 'All Categories',
    portraits: 'Portraits',
    fashion: 'Fashion',
    editorial: 'Editorial',
    commercial: 'Commercial',

    // Contact
    contact_title: 'Get In Touch',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send_message: 'Send Message',

    // Admin
    dashboard: 'Dashboard',
    photos: 'Photos',
    categories: 'Categories',
    messages: 'Messages',
    analytics: 'Analytics',
    add_photo: 'Add Photo',
    edit_photo: 'Edit Photo',
    delete_photo: 'Delete Photo',

    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    share: 'Share',
    download: 'Download',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    gallery: 'Galerie',
    about: 'À Propos',
    contact: 'Contact',
    admin: 'Admin',

    // Homepage
    hero_title: 'Modèle Professionnelle',
    hero_subtitle: 'Capturer les moments, créer l\'art',
    featured_photos: 'Photos Vedettes',
    latest_work: 'Derniers Travaux',
    view_gallery: 'Voir la Galerie',

    // Gallery
    all_categories: 'Toutes les Catégories',
    portraits: 'Portraits',
    fashion: 'Mode',
    editorial: 'Éditorial',
    commercial: 'Commercial',

    // Contact
    contact_title: 'Me Contacter',
    name: 'Nom',
    email: 'Email',
    message: 'Message',
    send_message: 'Envoyer le Message',

    // Admin
    dashboard: 'Tableau de Bord',
    photos: 'Photos',
    categories: 'Catégories',
    messages: 'Messages',
    analytics: 'Analytiques',
    add_photo: 'Ajouter Photo',
    edit_photo: 'Modifier Photo',
    delete_photo: 'Supprimer Photo',

    // Common
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    share: 'Partager',
    download: 'Télécharger',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && ['en', 'fr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  const autoTranslate = async (text: string) => {
    if (language === 'fr') return text;
    return await translateText(text, 'fr', language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, autoTranslate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};