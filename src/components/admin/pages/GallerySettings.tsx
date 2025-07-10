import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Save, Palette } from 'lucide-react';

const GallerySettings: React.FC = () => {
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryTitleColor, setGalleryTitleColor] = useState('#ffffff');
  const [galleryTitleSize, setGalleryTitleSize] = useState('4rem');
  const [galleryDesc, setGalleryDesc] = useState('');
  const [galleryDescColor, setGalleryDescColor] = useState('#d1d5db');
  const [galleryDescSize, setGalleryDescSize] = useState('1.25rem');
  const [photosPerPage, setPhotosPerPage] = useState('12');
  const [defaultView, setDefaultView] = useState('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallerySettings();
  }, []);

  const fetchGallerySettings = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'gallery_title', 'gallery_title_color', 'gallery_title_size',
          'gallery_desc', 'gallery_desc_color', 'gallery_desc_size',
          'gallery_photos_per_page', 'gallery_default_view',
          'gallery_show_filters', 'gallery_show_search'
        ]);

      if (data) {
        setGalleryTitle(data.find(row => row.key === 'gallery_title')?.value || '');
        setGalleryTitleColor(data.find(row => row.key === 'gallery_title_color')?.value || '#ffffff');
        setGalleryTitleSize(data.find(row => row.key === 'gallery_title_size')?.value || '4rem');
        setGalleryDesc(data.find(row => row.key === 'gallery_desc')?.value || '');
        setGalleryDescColor(data.find(row => row.key === 'gallery_desc_color')?.value || '#d1d5db');
        setGalleryDescSize(data.find(row => row.key === 'gallery_desc_size')?.value || '1.25rem');
        setPhotosPerPage(data.find(row => row.key === 'gallery_photos_per_page')?.value || '12');
        setDefaultView(data.find(row => row.key === 'gallery_default_view')?.value || 'grid');
        setShowFilters(data.find(row => row.key === 'gallery_show_filters')?.value !== 'false');
        setShowSearch(data.find(row => row.key === 'gallery_show_search')?.value !== 'false');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const saveGallerySettings = async () => {
    try {
      const settings = [
        { key: 'gallery_title', value: galleryTitle },
        { key: 'gallery_title_color', value: galleryTitleColor },
        { key: 'gallery_title_size', value: galleryTitleSize },
        { key: 'gallery_desc', value: galleryDesc },
        { key: 'gallery_desc_color', value: galleryDescColor },
        { key: 'gallery_desc_size', value: galleryDescSize },
        { key: 'gallery_photos_per_page', value: photosPerPage },
        { key: 'gallery_default_view', value: defaultView },
        { key: 'gallery_show_filters', value: showFilters ? 'true' : 'false' },
        { key: 'gallery_show_search', value: showSearch ? 'true' : 'false' },
      ];

      const { error } = await supabase.from('settings').upsert(settings);
      if (error) throw error;
      toast.success('Paramètres galerie sauvegardés');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  if (loading) {
    return <div className="text-white">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Paramètres de la Galerie</h2>
      </div>

      {/* Header Settings */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold flex items-center space-x-2">
          <Palette className="w-6 h-6" />
          <span>En-tête de la Galerie</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre de la galerie
            </label>
            <input
              type="text"
              value={galleryTitle}
              onChange={(e) => setGalleryTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Gallery"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={galleryDesc}
              onChange={(e) => setGalleryDesc(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Explore my complete portfolio"
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
                value={galleryTitleColor}
                onChange={(e) => setGalleryTitleColor(e.target.value)}
                className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={galleryTitleColor}
                onChange={(e) => setGalleryTitleColor(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Taille du titre
            </label>
            <input
              type="text"
              value={galleryTitleSize}
              onChange={(e) => setGalleryTitleSize(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="4rem"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Couleur de la description
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={galleryDescColor}
                onChange={(e) => setGalleryDescColor(e.target.value)}
                className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={galleryDescColor}
                onChange={(e) => setGalleryDescColor(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Taille de la description
            </label>
            <input
              type="text"
              value={galleryDescSize}
              onChange={(e) => setGalleryDescSize(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="1.25rem"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <h4 className="text-white font-medium mb-4">Aperçu de l'en-tête</h4>
          <div className="text-center">
            <h1 
              style={{ 
                color: galleryTitleColor, 
                fontSize: galleryTitleSize 
              }}
              className="font-bold mb-4"
            >
              {galleryTitle || 'Gallery'}
            </h1>
            <p 
              style={{ 
                color: galleryDescColor, 
                fontSize: galleryDescSize 
              }}
            >
              {galleryDesc || 'Explore my complete portfolio'}
            </p>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold">Paramètres d'Affichage</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Photos par page
            </label>
            <select
              value={photosPerPage}
              onChange={(e) => setPhotosPerPage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="6">6 photos</option>
              <option value="9">9 photos</option>
              <option value="12">12 photos</option>
              <option value="18">18 photos</option>
              <option value="24">24 photos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vue par défaut
            </label>
            <select
              value={defaultView}
              onChange={(e) => setDefaultView(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="grid">Grille</option>
              <option value="masonry">Mosaïque</option>
              <option value="list">Liste</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="showFilters"
              checked={showFilters}
              onChange={(e) => setShowFilters(e.target.checked)}
              className="w-5 h-5 text-gold bg-gray-800 border-gray-700 rounded focus:ring-gold focus:ring-2"
            />
            <label htmlFor="showFilters" className="text-gray-300">
              Afficher les filtres par catégorie
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="showSearch"
              checked={showSearch}
              onChange={(e) => setShowSearch(e.target.checked)}
              className="w-5 h-5 text-gold bg-gray-800 border-gray-700 rounded focus:ring-gold focus:ring-2"
            />
            <label htmlFor="showSearch" className="text-gray-300">
              Afficher la barre de recherche
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveGallerySettings}
          className="flex items-center space-x-2 px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200"
        >
          <Save className="w-5 h-5" />
          <span>Sauvegarder les Paramètres</span>
        </button>
      </div>
    </div>
  );
};

export default GallerySettings;