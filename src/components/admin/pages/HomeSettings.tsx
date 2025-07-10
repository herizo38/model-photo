import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Save, Plus, Edit, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface HeroSlide {
  id: string;
  image_url: string;
  video_url?: string;
  title: string;
  subtitle: string;
  position: number;
}

const HomeSettings: React.FC = () => {
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [showSocials, setShowSocials] = useState(true);
  const [loading, setLoading] = useState(true);
  const [slideForm, setSlideForm] = useState({ image_url: '', video_url: '', title: '', subtitle: '' });
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [selectedSlideFile, setSelectedSlideFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  // Ajout des états pour les sections vedette et réseaux sociaux
  const [featuredTitle, setFeaturedTitle] = useState('');
  const [featuredTitleColor, setFeaturedTitleColor] = useState('#ffffff');
  const [featuredTitleSize, setFeaturedTitleSize] = useState('3rem');
  const [featuredDesc, setFeaturedDesc] = useState('');
  const [socialTitle, setSocialTitle] = useState('');
  const [socialDesc, setSocialDesc] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [showContactForm, setShowContactForm] = useState(true);

  useEffect(() => {
    fetchHomeSettings();
    fetchHeroSlides();
  }, []);

  const fetchHomeSettings = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'hero_title', 'hero_subtitle', 'hero_show_socials',
          'featured_title', 'featured_title_color', 'featured_title_size', 'featured_desc',
          'social_title', 'social_desc',
          'telegram_url', 'tiktok_url',
          'show_contact_form'
        ]);
      if (data) {
        setHeroTitle(data.find(row => row.key === 'hero_title')?.value || '');
        setHeroSubtitle(data.find(row => row.key === 'hero_subtitle')?.value || '');
        setShowSocials(data.find(row => row.key === 'hero_show_socials')?.value !== 'false');
        setFeaturedTitle(data.find(row => row.key === 'featured_title')?.value || '');
        setFeaturedTitleColor(data.find(row => row.key === 'featured_title_color')?.value || '#ffffff');
        setFeaturedTitleSize(data.find(row => row.key === 'featured_title_size')?.value || '3rem');
        setFeaturedDesc(data.find(row => row.key === 'featured_desc')?.value || '');
        setSocialTitle(data.find(row => row.key === 'social_title')?.value || '');
        setSocialDesc(data.find(row => row.key === 'social_desc')?.value || '');
        setTelegramUrl(data.find(row => row.key === 'telegram_url')?.value || '');
        setTiktokUrl(data.find(row => row.key === 'tiktok_url')?.value || '');
        setShowContactForm(data.find(row => row.key === 'show_contact_form')?.value !== 'false');
      }
    } catch {
      toast.error('Erreur lors du chargement');
    }
  };

  const fetchHeroSlides = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('hero_slides')
        .select('*')
        .order('position', { ascending: true });
      setHeroSlides(data || []);
    } catch {
      toast.error('Erreur lors du chargement des slides');
    } finally {
      setLoading(false);
    }
  };

  const saveHeroSettings = async () => {
    try {
      const settings = [
        { key: 'hero_title', value: heroTitle },
        { key: 'hero_subtitle', value: heroSubtitle },
        { key: 'hero_show_socials', value: showSocials ? 'true' : 'false' },
      ];
      const { error } = await supabase.from('settings').upsert(settings);
      if (error) throw error;
      toast.success('Paramètres Hero sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const saveFeaturedSettings = async () => {
    try {
      const settings = [
        { key: 'featured_title', value: featuredTitle },
        { key: 'featured_title_color', value: featuredTitleColor },
        { key: 'featured_title_size', value: featuredTitleSize },
        { key: 'featured_desc', value: featuredDesc },
      ];
      const { error } = await supabase.from('settings').upsert(settings);
      if (error) throw error;
      toast.success('Paramètres section vedette sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };
  const saveSocialSettings = async () => {
    try {
      const settings = [
        { key: 'social_title', value: socialTitle },
        { key: 'social_desc', value: socialDesc },
        { key: 'telegram_url', value: telegramUrl },
        { key: 'tiktok_url', value: tiktokUrl },
      ];
      const { error } = await supabase.from('settings').upsert(settings);
      if (error) throw error;
      toast.success('Paramètres section sociale sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const saveContactFormSettings = async () => {
    try {
      const settings = [
        { key: 'show_contact_form', value: showContactForm ? 'true' : 'false' },
      ];
      const { error } = await supabase.from('settings').upsert(settings);
      if (error) throw error;
      toast.success('Paramètre formulaire de contact sauvegardé');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSlideFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedSlideFile(e.target.files[0]);
    }
  };
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideoFile(e.target.files[0]);
    }
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!selectedSlideFile && !slideForm.image_url) || !slideForm.title || !slideForm.subtitle) {
      toast.error('Tous les champs sont requis');
      return;
    }
    let imageUrl = slideForm.image_url;
    let videoUrl = slideForm.video_url;
    if (selectedSlideFile) {
      const fileExt = selectedSlideFile.name.split('.').pop();
      const fileName = `hero-slides/${Date.now()}-${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabase
        .storage
        .from('media')
        .upload(fileName, selectedSlideFile);
      if (uploadError) {
        toast.error("Erreur lors de l’upload de l’image de la slide");
        return;
      }
      const { data: publicUrlData } = supabase
        .storage
        .from('media')
        .getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }
    if (selectedVideoFile) {
      const fileExt = selectedVideoFile.name.split('.').pop();
      const fileName = `hero-slides/${Date.now()}-${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabase
        .storage
        .from('media')
        .upload(fileName, selectedVideoFile);
      if (uploadError) {
        toast.error("Erreur lors de l’upload de la vidéo de la slide");
        return;
      }
      const { data: publicUrlData } = supabase
        .storage
        .from('media')
        .getPublicUrl(fileName);
      videoUrl = publicUrlData.publicUrl;
    }
    const slideData = {
      id: editingSlideId || uuidv4(),
      image_url: imageUrl,
      video_url: videoUrl,
      title: slideForm.title,
      subtitle: slideForm.subtitle,
      position: heroSlides.length,
    };
    const { error } = await supabase
      .from('hero_slides')
      .upsert([slideData], { onConflict: 'id' });
    if (error) {
      toast.error('Erreur lors de la sauvegarde de la slide');
      return;
    }
    setSlideForm({ image_url: '', video_url: '', title: '', subtitle: '' });
    setEditingSlideId(null);
    setSelectedSlideFile(null);
    setSelectedVideoFile(null);
    await fetchHeroSlides();
  };

  const editSlide = (id: string) => {
    const slide = heroSlides.find(s => s.id === id);
    if (slide) {
      setSlideForm({
        image_url: slide.image_url,
        video_url: slide.video_url || '',
        title: slide.title,
        subtitle: slide.subtitle,
      });
      setEditingSlideId(id);
    }
  };

  const deleteSlide = async (id: string) => {
    if (confirm('Supprimer cette slide ?')) {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) {
        toast.error('Erreur lors de la suppression');
        return;
      }
      await fetchHeroSlides();
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const newSlides = Array.from(heroSlides);
    const [reorderedSlide] = newSlides.splice(result.source.index, 1);
    newSlides.splice(result.destination.index, 0, reorderedSlide);
    // Met à jour la position dans la BDD
    await Promise.all(newSlides.map((slide, idx) =>
      supabase.from('hero_slides').update({ position: idx }).eq('id', slide.id)
    ));
    setHeroSlides(newSlides);
  };

  if (loading) {
    return <div className="text-white">Chargement...</div>;
  }

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Paramètres Page d'Accueil</h2>
      </div>
      {/* Hero Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold">Section Hero</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre principal
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Professional Model"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sous-titre
            </label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Capturing moments, creating art"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="showSocials"
            checked={showSocials}
            onChange={(e) => setShowSocials(e.target.checked)}
            className="w-5 h-5 text-gold bg-gray-800 border-gray-700 rounded focus:ring-gold focus:ring-2"
          />
          <label htmlFor="showSocials" className="text-gray-300">
            Afficher les réseaux sociaux dans le Hero
          </label>
        </div>
        <button
          onClick={saveHeroSettings}
          className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Sauvegarder Hero</span>
        </button>
      </div>
      {/* Hero Slides */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold">Slides du bandeau</h3>
        <form onSubmit={handleSlideSubmit} className="space-y-4 p-6 bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleSlideFileChange}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              required={!slideForm.image_url}
            />
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {selectedSlideFile && (
              <p className="mt-1 text-xs text-green-400">Image sélectionnée : {selectedSlideFile.name}</p>
            )}
            {selectedVideoFile && (
              <p className="mt-1 text-xs text-blue-400">Vidéo sélectionnée : {selectedVideoFile.name}</p>
            )}
            {!selectedSlideFile && slideForm.image_url && (
              <img src={slideForm.image_url} alt="Aperçu" className="w-20 h-12 object-cover rounded mt-2" />
            )}
            {!selectedVideoFile && slideForm.video_url && (
              <video src={slideForm.video_url} className="w-20 h-12 object-cover rounded mt-2" controls />
            )}
            <input
              type="text"
              value={slideForm.title}
              onChange={(e) => setSlideForm(f => ({ ...f, title: e.target.value }))}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Titre de la slide"
              required
            />
            <input
              type="text"
              value={slideForm.subtitle}
              onChange={(e) => setSlideForm(f => ({ ...f, subtitle: e.target.value }))}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Sous-titre"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{editingSlideId !== null ? 'Modifier' : 'Ajouter'} Slide</span>
            </button>
            {editingSlideId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingSlideId(null);
                  setSlideForm({ image_url: '', video_url: '', title: '', subtitle: '' });
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="slides">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {heroSlides.map((slide, index) => (
                  <Draggable key={slide.id} draggableId={slide.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center space-x-4 p-4 bg-gray-800 rounded-lg ${snapshot.isDragging ? 'ring-2 ring-gold' : ''}`}
                      >
                        {slide.video_url ? (
                          <video src={slide.video_url} className="w-20 h-12 object-cover rounded" controls />
                        ) : (
                          <img src={slide.image_url} alt={slide.title} className="w-20 h-12 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{slide.title}</h4>
                          <p className="text-gray-400 text-sm">{slide.subtitle}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editSlide(slide.id)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSlide(slide.id)}
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
      </div>
      {/* Featured Photos Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold">Section Photos Vedettes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre de la section
            </label>
            <input
              type="text"
              value={featuredTitle}
              onChange={(e) => setFeaturedTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Featured Photos"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (HTML)
            </label>
            <ReactQuill
              theme="snow"
              value={featuredDesc}
              onChange={setFeaturedDesc}
              className="bg-white text-black rounded"
              style={{ minHeight: 120 }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Couleur du titre
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={featuredTitleColor}
                onChange={(e) => setFeaturedTitleColor(e.target.value)}
                className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={featuredTitleColor}
                onChange={(e) => setFeaturedTitleColor(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Taille du titre (ex: 3rem, 48px)
            </label>
            <input
              type="text"
              value={featuredTitleSize}
              onChange={(e) => setFeaturedTitleSize(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="3rem"
            />
          </div>
        </div>
        <button
          onClick={saveFeaturedSettings}
          className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Sauvegarder Section Vedette</span>
        </button>
      </div>
      {/* Social Media Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold">Section Réseaux Sociaux</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre de la section
            </label>
            <input
              type="text"
              value={socialTitle}
              onChange={(e) => setSocialTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Follow My Journey"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={socialDesc}
              onChange={(e) => setSocialDesc(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Stay updated with my latest work"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lien du chat Telegram
          </label>
          <input
            type="text"
            value={telegramUrl}
            onChange={(e) => setTelegramUrl(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            placeholder="https://t.me/ton_chat"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lien TikTok
          </label>
          <input
            type="text"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            placeholder="https://www.tiktok.com/@ton_compte"
          />
        </div>
        <button
          onClick={saveSocialSettings}
          className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Sauvegarder Section Sociale</span>
        </button>
      </div>
      {/* Formulaire de contact */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold">Formulaire de contact</h3>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="showContactForm"
            checked={showContactForm}
            onChange={(e) => setShowContactForm(e.target.checked)}
            className="w-5 h-5 text-gold bg-gray-800 border-gray-700 rounded focus:ring-gold focus:ring-2"
          />
          <label htmlFor="showContactForm" className="text-gray-300">
            Afficher le formulaire de contact sur la page d'accueil
          </label>
        </div>
        <button
          onClick={saveContactFormSettings}
          className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Sauvegarder</span>
        </button>
      </div>
    </div>
  );
};

export default HomeSettings;