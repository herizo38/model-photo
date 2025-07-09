import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Twitter, Facebook } from 'lucide-react';

interface SocialMediaProps {
  hero?: boolean;
}

const SocialMedia: React.FC<SocialMediaProps> = ({ hero }) => {
  const socialLinks = [
    { icon: Instagram, url: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, url: 'https://youtube.com', label: 'YouTube' },
    { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
    { icon: Facebook, url: 'https://facebook.com', label: 'Facebook' },
  ];

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
            Follow My Journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            Stay updated with my latest work and behind-the-scenes content
          </motion.p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {socialLinks.map((social) => (
            <motion.a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.2 }}
              className="flex flex-col items-center bg-gray-900 p-6 rounded-lg shadow-lg hover:bg-gold/10 transition-colors"
            >
              <span className="mb-2 text-gold"><social.icon className="w-8 h-8" /></span>
              <span className="text-white font-semibold">{social.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;