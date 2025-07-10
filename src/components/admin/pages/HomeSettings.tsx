import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Save, Plus, Edit, Trash2, Image, Palette } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

const HomeSettings: React.FC = () => {
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [showSocials, setShowSocials] = useState(true);
  
  // Featured section
  const [featuredTitle, setFeaturedTitle] = useState('');
  const [featuredTitleColor, setFeaturedTitleColor] = useState('#ffffff');
  const [featuredTitleSize, setFeaturedTitleSize] = useState('3rem');
  const [featuredDesc, setFeaturedDesc] = useState('');
  
  // Social section
  const [socialTitle, setSocialTitle] = useState('');
  const [socialDesc, setSocialDesc] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [slideForm, setSlideForm] = useState({ image: '', title: '', subtitle: '' });
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchHomeSettings();
  }, []);

  const fetchHomeSettings = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'hero_title', 'hero_subtitle', 'hero_slides', 'hero_show_socials',
          'featured_title', 'featured_title_color', 'featured_title_size', 'featured_desc',
          'social_title', 'social_desc'
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

        // Parse slides
        const slidesData = data.find(row => row.key === 'hero_slides')?.value;
        if (slidesData) {
          try {
            const slides = JSON.parse(slidesData);
            setHeroSlides(Array.isArray(slides) ? slides : []);
          } catch {
            setHeroSlides([]);
          }
        }
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const saveHeroSettings = async () => {
    try {
      const settings = [
        { key: 'hero_title', value: heroTitle },
        { key: 'hero_subtitle', value: heroSubtitle },
        { key: 'hero_slides', value: JSON.stringify(heroSlides) },
        { key: 'hero_show_socials', value: showSocials ? 'true' : 'false' },
      ];

      const { error } = await supabase.from('settings').upsert(settings);
      if (error) throw error;
      toast.success('Paramètres Hero sauvegardés');
    } catch (error) {
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
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const saveSocialSettings = async () => {
    try {
      const settings = [
        { key: 'social_title', value: socialTitle },
        { key: 'social_desc', value: socialDesc },
      ];

      const { error } = await supabase.from('settings').upsert(settings);
      if (error) throw error;
      toast.success('Paramètres section sociale sauvegardés');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.image || !slideForm.title || !slideForm.subtitle) {
      toast.error('Tous les champs sont requis');
      return;
    }

    const newSlides = [...heroSlides];
    if (editingSlideIndex !== null) {
      newSlides[editingSlideIndex] = { ...slideForm, id: newSlides[editingSlideIndex].id };
    } else {
      newSlides.push({ ...slideForm, id: uuidv4() });
    }

    setHeroSlides(newSlides);
    setSlideForm({ image: '', title: '', subtitle: '' });
    setEditingSlideIndex(null);
  };

  const editSlide = (index: number) => {
    setSlideForm(heroSlides[index]);
    setEditingSlideIndex(index);
  };

  const deleteSlide = (index: number) => {
    if (confirm('Supprimer cette slide ?')) {
      setHeroSlides(heroSlides.filter((_, i) => i !== index));
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newSlides = Array.from(heroSlides);
    const [reorderedSlide] = newSlides.splice(result.source.index, 1);
    newSlides.splice(result.destination.index, 0, reorderedSlide);
    
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
        <h3 className="text-xl font-bold text-gold">Slides du Hero</h3>
        
        <form onSubmit={handleSlideSubmit} className="space-y-4 p-6 bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="url"
              value={slideForm.image}
              onChange={(e) => setSlideForm(f => ({ ...f, image: e.target.value }))}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="URL de l'image"
              required
            />
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
              <span>{editingSlideIndex !== null ? 'Modifier' : 'Ajouter'} Slide</span>
            </button>
            {editingSlideIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingSlideIndex(null);
                  setSlideForm({ image: '', title: '', subtitle: '' });
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
                        className={`flex items-center space-x-4 p-4 bg-gray-800 rounded-lg ${
                          snapshot.isDragging ? 'ring-2 ring-gold' : ''
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{slide.title}</h4>
                          <p className="text-gray-400 text-sm">{slide.subtitle}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editSlide(index)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSlide(index)}
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
              Description
            </label>
            <input
              type="text"
              value={featuredDesc}
              onChange={(e) => setFeaturedDesc(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Latest work"
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

        <button
          onClick={saveSocialSettings}
          className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Sauvegarder Section Sociale</span>
        </button>
      </div>
    </div>
  );
};

export default HomeSettings;