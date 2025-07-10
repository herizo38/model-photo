import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Twitter, Facebook } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SocialMediaProps {
  hero?: boolean;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  active: boolean;
}
const SocialMedia: React.FC<SocialMediaProps> = ({ hero }) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialTitle, setSocialTitle] = useState('Follow My Journey');
  const [socialDesc, setSocialDesc] = useState('Stay updated with my latest work and behind-the-scenes content');

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        // Fetch social links
        const { data: linksData } = await supabase
          .from('social_links')
          .select('*')
          .eq('active', true)
          .order('order_index');

        // Fetch social section settings
        const { data: settingsData } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['social_title', 'social_desc']);

        setSocialLinks(linksData || []);
        
        if (settingsData) {
          setSocialTitle(settingsData.find(row => row.key === 'social_title')?.value || 'Follow My Journey');
          setSocialDesc(settingsData.find(row => row.key === 'social_desc')?.value || 'Stay updated with my latest work and behind-the-scenes content');
        }
      } catch (error) {
        console.error('Error fetching social data:', error);
      }
    };
    fetchSocialData();
  }, []);

  if (hero) {
    return (
      <div className="flex flex-col items-center gap-2 bg-transparent p-0">
        <span className="text-gold font-semibold text-lg mb-1">Follow me</span>
        <div className="flex gap-4">
          {socialLinks.map((social) => (
            <motion.a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
              className="text-gold hover:text-white transition-colors"
            >
              <social.icon className="w-8 h-8" />
            </motion.a>
          ))}
        </div>
      </div>
    );
  }
  // Ancienne présentation
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            {socialTitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            {socialDesc}
          </motion.p>
        </div>
        <div className={`grid gap-8 ${socialLinks.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : socialLinks.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.2 }}
              className="flex flex-col items-center bg-gray-900 p-6 rounded-lg shadow-lg hover:bg-gold/10 transition-colors"
            >
              {social.icon ? (
                <img src={social.icon} alt={social.platform} className="w-8 h-8 mb-2 object-contain" />
              ) : (
                <div className="w-8 h-8 mb-2 bg-gold rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">{social.platform.charAt(0)}</span>
                </div>
              )}
              <span className="text-white font-semibold">{social.platform}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;