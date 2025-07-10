import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Image, 
  Users, 
  MessageSquare, 
  Palette,
  Upload,
  Settings as SettingsIcon
} from 'lucide-react';
import HomeSettings from './pages/HomeSettings';
import GallerySettings from './pages/GallerySettings';
import AboutSettings from './pages/AboutSettings';
import ContactSettings from './pages/ContactSettings';
import SocialSettings from './pages/SocialSettings';
import GeneralSettings from './pages/GeneralSettings';
import PresentationSettings from './pages/PresentationSettings';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Général', icon: SettingsIcon },
    { id: 'home', name: 'Accueil', icon: Home },
    { id: 'presentation', name: 'Présentation', icon: Users },
    { id: 'gallery', name: 'Galerie', icon: Image },
    { id: 'about', name: 'À Propos', icon: Users },
    { id: 'contact', name: 'Contact', icon: MessageSquare },
    { id: 'social', name: 'Réseaux Sociaux', icon: Palette },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'home':
        return <HomeSettings />;
      case 'presentation':
        return <PresentationSettings />;
      case 'gallery':
        return <GallerySettings />;
      case 'about':
        return <AboutSettings />;
      case 'contact':
        return <ContactSettings />;
      case 'social':
        return <SocialSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres du Site</h1>
          <p className="text-gray-400">Personnalisez tous les aspects de votre portfolio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-4">Sections</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gold text-black'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 rounded-lg p-6"
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;