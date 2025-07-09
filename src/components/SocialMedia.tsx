import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Twitter, Facebook } from 'lucide-react';

const SocialMedia: React.FC = () => {
  const socialLinks = [
    { icon: Instagram, url: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, url: 'https://youtube.com', label: 'YouTube' },
    { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
    { icon: Facebook, url: 'https://facebook.com', label: 'Facebook' },
  ];

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
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group flex flex-col items-center space-y-4 p-6 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
            >
              <div className="p-4 bg-gold/10 rounded-full group-hover:bg-gold/20 transition-colors">
                <social.icon className="w-8 h-8 text-gold" />
              </div>
              <span className="text-white font-medium">{social.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;