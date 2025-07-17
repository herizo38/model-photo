import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Camera, Heart, Star } from 'lucide-react';
import { useLanguage, useFontFamily } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import GeoBlockedMessage from '../components/GeoBlockedMessage';
import useGeoBlock from '../hooks/useGeoBlock';

const About: React.FC = () => {
  const { t } = useLanguage();
  const { fontFamilyTitle } = useFontFamily();
  const [aboutText, setAboutText] = useState('');
  const [bioLink, setBioLink] = useState('');
  const [journey, setJourney] = useState('');
  const [achievements, setAchievements] = useState<{ id: string, image: string, title: string, desc: string }[]>([]);
  const [specialties, setSpecialties] = useState<{ id: string, image: string, title: string, desc: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [aboutStats, setAboutStats] = useState<{ id: string; icon: 'Camera' | 'Award' | 'Heart' | 'Star'; number: string; label: string; color?: string; size?: string }[]>([]);
  const [cta, setCta] = useState({ title: '', desc: '', btn: '', btnLink: '', btnColor: '#d4af37', titleSize: '2rem' });
  const { isBlocked, loadingBlock } = useGeoBlock();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', [
            'about_text', 'bio_link', 'about_journey', 'about_achievements', 'about_specialties',
            'about_stats', 'about_cta_title', 'about_cta_desc', 'about_cta_btn', 'about_cta_btn_link', 'about_cta_btn_color', 'about_cta_title_size'
          ]);
        if (data) {
          setAboutText(data.find((row) => row.key === 'about_text')?.value || '');
          setBioLink(data.find((row) => row.key === 'bio_link')?.value || '');
          setJourney(data.find((row) => row.key === 'about_journey')?.value || '');
          // Achievements
          let achievementsArr = [];
          try {
            achievementsArr = JSON.parse(data.find((row) => row.key === 'about_achievements')?.value || '[]');
          } catch { achievementsArr = []; }
          setAchievements(Array.isArray(achievementsArr) ? achievementsArr : []);
          // Specialties
          let specialtiesArr = [];
          try {
            specialtiesArr = JSON.parse(data.find((row) => row.key === 'about_specialties')?.value || '[]');
          } catch { specialtiesArr = []; }
          setSpecialties(Array.isArray(specialtiesArr) ? specialtiesArr : []);
          // Stats
          let statsArr = [];
          try {
            statsArr = JSON.parse(data.find((row) => row.key === 'about_stats')?.value || '[]');
          } catch { statsArr = []; }
          setAboutStats(Array.isArray(statsArr) ? statsArr : []);
          // CTA
          setCta({
            title: data.find((row) => row.key === 'about_cta_title')?.value || '',
            desc: data.find((row) => row.key === 'about_cta_desc')?.value || '',
            btn: data.find((row) => row.key === 'about_cta_btn')?.value || '',
            btnLink: data.find((row) => row.key === 'about_cta_btn_link')?.value || '',
            btnColor: data.find((row) => row.key === 'about_cta_btn_color')?.value || '#d4af37',
            titleSize: data.find((row) => row.key === 'about_cta_title_size')?.value || '2rem',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchContent();

  }, []);

  if (loadingBlock) return null;
  if (isBlocked) return <GeoBlockedMessage />;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-4xl md:text-6xl font-bold text-white mb-4 font-${fontFamilyTitle}`}
          >
            {t('about')}
          </motion.h1>
          {loading ? (
            <div className="text-gray-400">Chargement...</div>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-300 whitespace-pre-line"
            >
              {aboutText || 'Bienvenue sur mon portfolio professionnel.'}
            </motion.p>
          )}
          {bioLink && !loading && (
            <div className="mt-6">
              <a
                href={bioLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-gold text-black font-semibold rounded-full hover:bg-gold/90 transition"
              >
                Voir mon lien bio
              </a>
            </div>
          )}
        </div>

        {/* My Journey */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-white mb-6">Mon parcours</h2>
              <div className="space-y-4 text-gray-300 whitespace-pre-line">
                {loading ? 'Chargement...' : (journey || 'Racontez votre histoire ici.')}
              </div>
            </div>

            <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-white mb-4">Spécialités</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="text-gray-400">Chargement...</div>
                ) : specialties.length === 0 ? (
                  <div className="text-gray-400">Aucune spécialité renseignée.</div>
                ) : specialties.map((spec) => (
                  <div key={spec.id} className="text-center p-4 bg-gold/10 rounded-lg flex flex-col items-center">
                    <img src={spec.image || 'https://via.placeholder.com/400x250?text=Image'} alt={spec.title} className="w-full h-24 object-cover rounded mb-2" />
                    <h4 className="font-semibold text-gold mb-2">{spec.title}</h4>
                    <p className="text-sm text-gray-300">{spec.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-white mb-6">Réalisations récentes</h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-400">Chargement...</div>
                ) : achievements.length === 0 ? (
                  <div className="text-gray-400">Aucune réalisation renseignée.</div>
                ) : achievements.map((ach) => (
                  <div key={ach.id} className="flex items-start space-x-3">
                    <img src={ach.image || 'https://via.placeholder.com/80x80?text=Image'} alt={ach.title} className="w-14 h-14 object-cover rounded mr-2" />
                    <div>
                      <h4 className="font-semibold text-white">{ach.title}</h4>
                      {ach.desc && <p className="text-sm text-gray-300">{ach.desc}</p>}
                    </div>
                  </div>
                ))}
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
          {aboutStats.length === 0 ? (
            <div className="col-span-4 text-center text-gray-400">Aucune statistique renseignée.</div>
          ) : aboutStats.map((stat, index) => {
            const icons = { Camera, Award, Heart, Star };
            const Icon = icons[stat.icon] || Camera;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-gray-900 p-6 rounded-lg"
              >
                <div className="flex justify-center mb-4">
                  <Icon style={{ color: stat.color || '#d4af37', fontSize: stat.size || '2rem' }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: stat.color || '#d4af37', fontSize: stat.size || '2rem' }}>{stat.number}</h3>
                <p className="text-gray-300">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center bg-gray-900 p-12 rounded-lg"
        >
          <h2 className="font-bold mb-4" style={{ color: '#fff', fontSize: cta.titleSize }}>{cta.title || 'Ready to Work Together?'}</h2>
          <p className="text-xl text-gray-300 mb-8">
            {cta.desc || "Let's create something extraordinary together. I'm always open to new and exciting projects."}
          </p>
          {cta.btn && (
            <a
              href={cta.btnLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button
                style={{ backgroundColor: cta.btnColor, color: '#000' }}
                className="px-8 py-3 font-semibold rounded-full transition-all duration-200 transform hover:scale-105"
              >
                {cta.btn}
              </button>
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default About;