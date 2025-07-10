import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Save, Plus, Edit, Trash2, Upload, Eye, EyeOff } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  active: boolean;
  order_index: number;
  iconColor: string;
  textColor: string;
}

interface HeroSocial {
  id: string;
  icon: string;
  name: string;
  url: string;
  desc?: string;
  customIcon?: string;
  iconColor: string;
  textColor: string;
}

const SocialSettings: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [heroSocials, setHeroSocials] = useState<HeroSocial[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [linkForm, setLinkForm] = useState({
    platform: '',
    url: '',
    icon: '',
    active: true,
    iconColor: '#FFD700',
    textColor: '#fff'
  });
  const [heroForm, setHeroForm] = useState({
    icon: 'Instagram',
    name: '',
    url: '',
    desc: '',
    customIcon: '',
    iconColor: '#FFD700',
    textColor: '#fff'
  });

  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [editingHeroIndex, setEditingHeroIndex] = useState<number | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const iconOptions = ['Instagram', 'YouTube', 'Twitter', 'Facebook', 'Telegram', 'Uncove', 'Autre'];

  useEffect(() => {
    fetchSocialSettings();
  }, []);

  const fetchSocialSettings = async () => {
    try {
      // Fetch social links
      const { data: linksData } = await supabase
        .from('social_links')
        .select('*')
        .order('order_index');

      // Fetch hero socials
      const { data: settingsData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'hero_socials')
        .maybeSingle();

      setSocialLinks(linksData || []);

      if (settingsData?.value) {
        try {
          const heroData = JSON.parse(settingsData.value);
          setHeroSocials(Array.isArray(heroData) ? heroData : []);
        } catch {
          setHeroSocials([]);
        }
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const saveSocialLinks = async () => {
    try {
      // Delete all existing links
      await supabase.from('social_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert updated links
      if (socialLinks.length > 0) {
        const { error } = await supabase
          .from('social_links')
          .insert(socialLinks.map((link, index) => ({
            ...link,
            order_index: index
          })));

        if (error) throw error;
      }

      toast.success('Liens sociaux sauvegardés');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const saveHeroSocials = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'hero_socials',
          value: JSON.stringify(heroSocials)
        });

      if (error) throw error;
      toast.success('Réseaux sociaux du bandeau sauvegardés');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleIconUpload = async () => {
    if (!iconFile) return '';

    setUploading(true);
    try {
      const fileExt = iconFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('social-icons')
        .upload(fileName, iconFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('social-icons')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
      return '';
    } finally {
      setUploading(false);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkForm.platform || !linkForm.url) {
      toast.error('Plateforme et URL sont requis');
      return;
    }

    let iconUrl = linkForm.icon;
    if (iconFile) {
      iconUrl = await handleIconUpload();
      if (!iconUrl) return;
    }

    const newLinks = [...socialLinks];
    if (editingLinkIndex !== null) {
      newLinks[editingLinkIndex] = {
        ...newLinks[editingLinkIndex],
        ...linkForm,
        icon: iconUrl
      };
    } else {
      newLinks.push({
        id: uuidv4(),
        ...linkForm,
        icon: iconUrl,
        order_index: newLinks.length
      });
    }

    setSocialLinks(newLinks);
    setLinkForm({ platform: '', url: '', icon: '', active: true, iconColor: '#FFD700', textColor: '#fff' });
    setEditingLinkIndex(null);
    setIconFile(null);
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroForm.name || !heroForm.url) {
      toast.error('Nom et URL sont requis');
      return;
    }

    let customIconUrl = heroForm.customIcon;
    if (iconFile) {
      customIconUrl = await handleIconUpload();
      if (!customIconUrl) return;
    }

    const newHeroSocials = [...heroSocials];
    if (editingHeroIndex !== null) {
      newHeroSocials[editingHeroIndex] = {
        ...heroForm,
        customIcon: customIconUrl,
        id: newHeroSocials[editingHeroIndex].id
      };
    } else {
      newHeroSocials.push({
        ...heroForm,
        customIcon: customIconUrl,
        id: uuidv4()
      });
    }

    setHeroSocials(newHeroSocials);
    setHeroForm({ icon: 'Instagram', name: '', url: '', desc: '', customIcon: '', iconColor: '#FFD700', textColor: '#fff' });
    setEditingHeroIndex(null);
    setIconFile(null);
  };

  const onDragEnd = (result: DropResult, type: 'links' | 'hero') => {
    if (!result.destination) return;

    if (type === 'links') {
      const newLinks = Array.from(socialLinks);
      const [reorderedLink] = newLinks.splice(result.source.index, 1);
      newLinks.splice(result.destination.index, 0, reorderedLink);
      setSocialLinks(newLinks);
    } else {
      const newHeroSocials = Array.from(heroSocials);
      const [reorderedSocial] = newHeroSocials.splice(result.source.index, 1);
      newHeroSocials.splice(result.destination.index, 0, reorderedSocial);
      setHeroSocials(newHeroSocials);
    }
  };

  if (loading) {
    return <div className="text-white">Chargement...</div>;
  }

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Paramètres Réseaux Sociaux</h2>
      </div>

      {/* Social Links Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold">Liens Réseaux Sociaux (Section dédiée)</h3>

        <form onSubmit={handleLinkSubmit} className="space-y-4 p-6 bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={linkForm.platform}
              onChange={(e) => setLinkForm(f => ({ ...f, platform: e.target.value }))}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Nom de la plateforme"
              required
            />
            <input
              type="url"
              value={linkForm.url}
              onChange={(e) => setLinkForm(f => ({ ...f, url: e.target.value }))}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="URL du profil"
              required
            />
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-black hover:file:bg-gold/90"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-gray-300 text-sm">Couleur icône</label>
            <input
              type="color"
              value={linkForm.iconColor}
              onChange={e => setLinkForm(f => ({ ...f, iconColor: e.target.value }))}
              className="w-10 h-10 rounded"
            />
            <label className="text-gray-300 text-sm">Couleur texte</label>
            <input
              type="color"
              value={linkForm.textColor}
              onChange={e => setLinkForm(f => ({ ...f, textColor: e.target.value }))}
              className="w-10 h-10 rounded"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={linkForm.active}
                onChange={(e) => setLinkForm(f => ({ ...f, active: e.target.checked }))}
                className="w-5 h-5 text-gold bg-gray-700 border-gray-600 rounded focus:ring-gold focus:ring-2"
              />
              <span className="text-gray-300">Actif</span>
            </label>

            <button
              type="submit"
              disabled={uploading}
              className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{editingLinkIndex !== null ? 'Modifier' : 'Ajouter'}</span>
            </button>

            {editingLinkIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingLinkIndex(null);
                  setLinkForm({ platform: '', url: '', icon: '', active: true, iconColor: '#FFD700', textColor: '#fff' });
                  setIconFile(null);
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </form>

        <DragDropContext onDragEnd={(result) => onDragEnd(result, 'links')}>
          <Droppable droppableId="social-links">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {socialLinks.map((link, index) => (
                  <Draggable key={link.id} draggableId={link.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center space-x-4 p-4 bg-gray-800 rounded-lg ${snapshot.isDragging ? 'ring-2 ring-gold' : ''
                          }`}
                      >
                        {link.icon && (
                          <img src={link.icon} alt={link.platform} className="w-10 h-10 object-contain rounded" style={{ backgroundColor: link.iconColor }} />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium" style={{ color: link.textColor }}>{link.platform}</h4>
                          <p className="text-sm truncate" style={{ color: link.textColor }}>{link.url}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {link.active ? (
                            <Eye className="w-5 h-5 text-green-400" />
                          ) : (
                            <EyeOff className="w-5 h-5 text-gray-500" />
                          )}
                          <button
                            onClick={() => {
                              setLinkForm(link);
                              setEditingLinkIndex(index);
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Supprimer ce lien ?')) {
                                setSocialLinks(socialLinks.filter((_, i) => i !== index));
                              }
                            }}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button
          onClick={saveSocialLinks}
          className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Sauvegarder Liens Sociaux</span>
        </button>
      </div>

      {/* Hero Socials Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold">Réseaux Sociaux du bandeau</h3>

        <form onSubmit={handleHeroSubmit} className="space-y-4 p-6 bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={heroForm.icon}
              onChange={(e) => setHeroForm(f => ({ ...f, icon: e.target.value }))}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            >
              {iconOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <input
              type="text"
              value={heroForm.name}
              onChange={(e) => setHeroForm(f => ({ ...f, name: e.target.value }))}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Nom affiché"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="url"
              value={heroForm.url}
              onChange={(e) => setHeroForm(f => ({ ...f, url: e.target.value }))}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="URL du profil"
              required
            />

            <input
              type="text"
              value={heroForm.desc}
              onChange={(e) => setHeroForm(f => ({ ...f, desc: e.target.value }))}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Description (optionnelle)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icône personnalisée (optionnelle)
            </label>
            <input
              type="file"
              accept="image/*,.svg"
              onChange={(e) => setIconFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-black hover:file:bg-gold/90"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-gray-300 text-sm">Couleur icône</label>
            <input
              type="color"
              value={heroForm.iconColor}
              onChange={e => setHeroForm(f => ({ ...f, iconColor: e.target.value }))}
              className="w-10 h-10 rounded"
            />
            <label className="text-gray-300 text-sm">Couleur texte</label>
            <input
              type="color"
              value={heroForm.textColor}
              onChange={e => setHeroForm(f => ({ ...f, textColor: e.target.value }))}
              className="w-10 h-10 rounded"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{editingHeroIndex !== null ? 'Modifier' : 'Ajouter'}</span>
            </button>

            {editingHeroIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingHeroIndex(null);
                  setHeroForm({ icon: 'Instagram', name: '', url: '', desc: '', customIcon: '', iconColor: '#FFD700', textColor: '#fff' });
                  setIconFile(null);
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </form>

        <DragDropContext onDragEnd={(result) => onDragEnd(result, 'hero')}>
          <Droppable droppableId="hero-socials">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {heroSocials.map((social, index) => (
                  <Draggable key={social.id} draggableId={social.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center space-x-4 p-4 bg-gray-800 rounded-lg ${snapshot.isDragging ? 'ring-2 ring-gold' : ''
                          }`}
                      >
                        {social.customIcon ? (
                          <img src={social.customIcon} alt={social.name} className="w-10 h-10 object-contain rounded bg-white" style={{ backgroundColor: social.iconColor }} />
                        ) : (
                          <div className="w-10 h-10 rounded flex items-center justify-center font-bold" style={{ backgroundColor: social.iconColor, color: social.textColor }}>
                            {social.icon.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium" style={{ color: social.textColor }}>{social.name}</h4>
                          <p className="text-sm" style={{ color: social.textColor }}>{social.icon}</p>
                          {social.desc && <p className="text-xs" style={{ color: social.textColor }}>{social.desc}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setHeroForm(social);
                              setEditingHeroIndex(index);
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Supprimer ce réseau social ?')) {
                                setHeroSocials(heroSocials.filter((_, i) => i !== index));
                              }
                            }}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button
          onClick={saveHeroSocials}
          className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Sauvegarder Hero Sociaux</span>
        </button>
      </div>
    </div>
  );
};

export default SocialSettings;