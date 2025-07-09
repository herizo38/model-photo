import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Globe, 
  Palette, 
  Save,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Link
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  active: boolean;
  order_index: number;
}

interface SettingsForm {
  site_title: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_instagram: string;
  social_facebook: string;
  social_twitter: string;
  social_youtube: string;
  social_tiktok: string;
  social_linkedin: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<Array<{ id: string; ip_address: string; reason?: string; created_at: string }>>([]);
  const [newIP, setNewIP] = useState('');
  const [newIPReason, setNewIPReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsForm>();

  useEffect(() => {
    fetchSocialLinks();
    fetchBlockedIPs();
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('portfolio_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      reset(settings);
    }
  };

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  };

  const fetchBlockedIPs = async () => {
    try {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlockedIPs(data || []);
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
    }
  };

  const onSubmit = async (data: SettingsForm) => {
    try {
      // Save settings to localStorage (in a real app, you'd save to database)
      localStorage.setItem('portfolio_settings', JSON.stringify(data));
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const addBlockedIP = async () => {
    if (!newIP.trim()) {
      toast.error('Veuillez entrer une adresse IP');
      return;
    }

    try {
      const { error } = await supabase
        .from('blocked_ips')
        .insert([{
          ip_address: newIP.trim(),
          reason: newIPReason.trim() || null,
          blocked_by: user?.id
        }]);

      if (error) throw error;
      
      setNewIP('');
      setNewIPReason('');
      fetchBlockedIPs();
      toast.success('IP bloquée avec succès');
    } catch (error) {
      toast.error('Erreur lors du blocage de l\'IP');
    }
  };

  const removeBlockedIP = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir débloquer cette IP ?')) return;

    try {
      const { error } = await supabase
        .from('blocked_ips')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchBlockedIPs();
      toast.success('IP débloquée avec succès');
    } catch (error) {
      toast.error('Erreur lors du déblocage de l\'IP');
    }
  };

  const updateSocialLink = async (id: string, updates: Partial<SocialLink>) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      fetchSocialLinks();
      toast.success('Lien social mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const tabs = [
    { id: 'general', name: 'Général', icon: SettingsIcon },
    { id: 'social', name: 'Réseaux sociaux', icon: Globe },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'appearance', name: 'Apparence', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
          <p className="text-gray-400">Configurez votre portfolio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-4">
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
            <div className="bg-gray-900 rounded-lg p-6">
              {activeTab === 'general' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Paramètres généraux</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Titre du site
                        </label>
                        <input
                          {...register('site_title')}
                          type="text"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          placeholder="Mon Portfolio"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email de contact
                        </label>
                        <input
                          {...register('contact_email')}
                          type="email"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description du site
                      </label>
                      <textarea
                        {...register('site_description')}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                        placeholder="Description de votre portfolio..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Téléphone
                        </label>
                        <input
                          {...register('contact_phone')}
                          type="tel"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Adresse
                        </label>
                        <input
                          {...register('contact_address')}
                          type="text"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          placeholder="Paris, France"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>Sauvegarder</span>
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'social' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Réseaux sociaux</h2>
                  <div className="space-y-6">
                    {[
                      { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
                      { key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
                      { key: 'social_twitter', label: 'Twitter', placeholder: 'https://twitter.com/username' },
                      { key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/channel/...' },
                      { key: 'social_tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
                      { key: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
                    ].map((social) => (
                      <div key={social.key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Link className="w-4 h-4 inline mr-2" />
                          {social.label}
                        </label>
                        <input
                          {...register(social.key as keyof SettingsForm)}
                          type="url"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          placeholder={social.placeholder}
                        />
                      </div>
                    ))}
                    
                    <button
                      onClick={handleSubmit(onSubmit)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>Sauvegarder les liens</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Sécurité</h2>
                  
                  {/* Blocked IPs */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-white mb-4">IPs bloquées</h3>
                    
                    {/* Add new blocked IP */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <input
                          type="text"
                          value={newIP}
                          onChange={(e) => setNewIP(e.target.value)}
                          placeholder="Adresse IP (ex: 192.168.1.1)"
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                        <input
                          type="text"
                          value={newIPReason}
                          onChange={(e) => setNewIPReason(e.target.value)}
                          placeholder="Raison (optionnel)"
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                        <button
                          onClick={addBlockedIP}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Bloquer</span>
                        </button>
                      </div>
                    </div>

                    {/* Blocked IPs list */}
                    <div className="space-y-2">
                      {blockedIPs.map((ip) => (
                        <div key={ip.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                          <div>
                            <span className="text-white font-medium">{ip.ip_address}</span>
                            {ip.reason && (
                              <p className="text-gray-400 text-sm">{ip.reason}</p>
                            )}
                            <p className="text-gray-500 text-xs">
                              Bloquée le {new Date(ip.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <button
                            onClick={() => removeBlockedIP(ip.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            title="Débloquer cette IP"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {blockedIPs.length === 0 && (
                        <div className="text-center py-8">
                          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">Aucune IP bloquée</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Change Password */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Changer le mot de passe</h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Mot de passe actuel
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                              placeholder="Mot de passe actuel"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Nouveau mot de passe
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                              placeholder="Nouveau mot de passe"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Confirmer le mot de passe
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
                              placeholder="Confirmer le mot de passe"
                            />
                          </div>
                        </div>
                        
                        <button
                          className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
                        >
                          <Save className="w-5 h-5" />
                          <span>Changer le mot de passe</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Apparence</h2>
                  <div className="text-center py-12">
                    <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Personnalisation du thème</h3>
                    <p className="text-gray-400">Les options de personnalisation seront bientôt disponibles</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;