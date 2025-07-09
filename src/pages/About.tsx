import React from 'react';
import { motion } from 'framer-motion';
import { Award, Camera, Heart, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: Camera, number: '500+', label: 'Photo Shoots' },
    { icon: Award, number: '15+', label: 'Awards Won' },
    { icon: Heart, number: '1M+', label: 'Social Followers' },
    { icon: Star, number: '50+', label: 'Brand Collaborations' },
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            {t('about')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            Professional model with a passion for art and storytelling
          </motion.p>
        </div>

        {/* About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-white mb-6">My Journey</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  With over 8 years of experience in the modeling industry, I've had the privilege 
                  of working with renowned photographers, fashion designers, and brands worldwide.
                </p>
                <p>
                  My journey began at the age of 16 when I was discovered by a talent scout in Paris. 
                  Since then, I've walked runways for major fashion houses, graced magazine covers, 
                  and collaborated with luxury brands.
                </p>
                <p>
                  What sets me apart is my ability to tell stories through every pose, every expression, 
                  and every photograph. I believe that modeling is not just about beauty—it's about 
                  connecting with people and conveying emotions.
                </p>
              </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-white mb-4">Specialties</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gold/10 rounded-lg">
                  <h4 className="font-semibold text-gold mb-2">Fashion</h4>
                  <p className="text-sm text-gray-300">Editorial & Commercial</p>
                </div>
                <div className="text-center p-4 bg-gold/10 rounded-lg">
                  <h4 className="font-semibold text-gold mb-2">Beauty</h4>
                  <p className="text-sm text-gray-300">Cosmetics & Skincare</p>
                </div>
                <div className="text-center p-4 bg-gold/10 rounded-lg">
                  <h4 className="font-semibold text-gold mb-2">Portrait</h4>
                  <p className="text-sm text-gray-300">Studio & Lifestyle</p>
                </div>
                <div className="text-center p-4 bg-gold/10 rounded-lg">
                  <h4 className="font-semibold text-gold mb-2">Commercial</h4>
                  <p className="text-sm text-gray-300">Brand Campaigns</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-white mb-6">Recent Achievements</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Award className="w-6 h-6 text-gold mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Model of the Year 2023</h4>
                    <p className="text-sm text-gray-300">Fashion Awards International</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="w-6 h-6 text-gold mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Vogue Cover Feature</h4>
                    <p className="text-sm text-gray-300">September 2023 Issue</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="w-6 h-6 text-gold mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">Brand Ambassador</h4>
                    <p className="text-sm text-gray-300">Luxury Fashion House</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Professional headshot"
                className="w-full h-80 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
            </div>
          </motion.div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center bg-gray-900 p-6 rounded-lg"
            >
              <div className="flex justify-center mb-4">
                <stat.icon className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{stat.number}</h3>
              <p className="text-gray-300">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center bg-gray-900 p-12 rounded-lg"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Work Together?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's create something extraordinary together. I'm always open to new and exciting projects.
          </p>
          <button className="px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-full transition-all duration-200 transform hover:scale-105">
            Get in Touch
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default About;