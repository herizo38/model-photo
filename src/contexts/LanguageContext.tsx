import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateText } from '../lib/translate';
import { supabase } from '../lib/supabase';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  autoTranslate: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface FontFamilyContextProps {
  fontFamilyTitle: string;
  fontFamilyText: string;
  loading: boolean;
}

const FontFamilyContext = createContext<FontFamilyContextProps>({
  fontFamilyTitle: 'playfair',
  fontFamilyText: 'cormorant',
  loading: true,
});

interface ColorContextProps {
  primaryColor: string;
  buttonColor: string;
  backgroundColor: string;
  textColor: string;
  loading: boolean;
}

const ColorContext = createContext<ColorContextProps>({
  primaryColor: '#d4af37',
  buttonColor: '#d4af37',
  backgroundColor: '#000000',
  textColor: '#ffffff',
  loading: true,
});

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
    view_gallery: 'Galerie',

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

export const useFontFamily = () => useContext(FontFamilyContext);

export const FontFamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontFamilyTitle, setFontFamilyTitle] = useState('playfair');
  const [fontFamilyText, setFontFamilyText] = useState('cormorant');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFontSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['font_family_title', 'font_family_text']);
      setFontFamilyTitle(data?.find(row => row.key === 'font_family_title')?.value || 'playfair');
      setFontFamilyText(data?.find(row => row.key === 'font_family_text')?.value || 'cormorant');
      setLoading(false);
    };
    fetchFontSettings();
  }, []);

  return (
    <FontFamilyContext.Provider value={{ fontFamilyTitle, fontFamilyText, loading }}>
      {children}
    </FontFamilyContext.Provider>
  );
};

export const useColor = () => useContext(ColorContext);

export const ColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#d4af37');
  const [buttonColor, setButtonColor] = useState('#d4af37');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColors = async () => {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['primary_color', 'button_color', 'background_color', 'text_color']);
      setPrimaryColor(data?.find(row => row.key === 'primary_color')?.value || '#d4af37');
      setButtonColor(data?.find(row => row.key === 'button_color')?.value || '#d4af37');
      setBackgroundColor(data?.find(row => row.key === 'background_color')?.value || '#000000');
      setTextColor(data?.find(row => row.key === 'text_color')?.value || '#ffffff');
      setLoading(false);
    };
    fetchColors();
  }, []);

  useEffect(() => {
    if (!loading) {
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-button', buttonColor);
      document.documentElement.style.setProperty('--color-background', backgroundColor);
      document.documentElement.style.setProperty('--color-text', textColor);
    }
  }, [primaryColor, buttonColor, backgroundColor, textColor, loading]);

  return (
    <ColorContext.Provider value={{ primaryColor, buttonColor, backgroundColor, textColor, loading }}>
      {children}
    </ColorContext.Provider>
  );
};