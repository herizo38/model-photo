import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Save, Palette, Type, Image, Eye, EyeOff, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PresentationSettings: React.FC = () => {
  const [presentation, setPresentation] = useState({
    title: '',
    titleColor: '#ffffff',
    titleSize: '3rem',
    subtitle: '',
    subtitleColor: '#d1d5db',
    subtitleSize: '1.25rem',
    description: '',
    descriptionColor: '#9ca3af',
    descriptionSize: '1rem',
    buttonText: '',
    buttonLink: '',
    buttonColor: '#d4af37',
    buttonTextColor: '#000000',
    showButton: true,
    backgroundImage: '',
    backgroundColor: '#111827',
    overlayOpacity: '0.5',
    textAlign: 'center',
    maxWidth: '4xl',
    padding: '20',
    visible: true
  });
  const [loading, setLoading] = useState(true);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPresentationSettings();
  }, []);

  const fetchPresentationSettings = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'presentation_title', 'presentation_title_color', 'presentation_title_size',
          'presentation_subtitle', 'presentation_subtitle_color', 'presentation_subtitle_size',
          'presentation_description', 'presentation_description_color', 'presentation_description_size',
          'presentation_button_text', 'presentation_button_link', 'presentation_button_color',
          'presentation_button_text_color', 'presentation_show_button', 'presentation_background_image',
          'presentation_background_color', 'presentation_overlay_opacity', 'presentation_text_align',
          'presentation_max_width', 'presentation_padding', 'presentation_visible'
        ]);

      if (data) {
        setPresentation({
          title: data.find(row => row.key === 'presentation_title')?.value || '',
          titleColor: data.find(row => row.key === 'presentation_title_color')?.value || '#ffffff',
          titleSize: data.find(row => row.key === 'presentation_title_size')?.value || '3rem',
          subtitle: data.find(row => row.key === 'presentation_subtitle')?.value || '',
          subtitleColor: data.find(row => row.key === 'presentation_subtitle_color')?.value || '#d1d5db',
          subtitleSize: data.find(row => row.key === 'presentation_subtitle_size')?.value || '1.25rem',
          description: data.find(row => row.key === 'presentation_description')?.value || '',
          descriptionColor: data.find(row => row.key === 'presentation_description_color')?.value || '#9ca3af',
          descriptionSize: data.find(row => row.key === 'presentation_description_size')?.value || '1rem',
          buttonText: data.find(row => row.key === 'presentation_button_text')?.value || '',
          buttonLink: data.find(row => row.key === 'presentation_button_link')?.value || '',
          buttonColor: data.find(row => row.key === 'presentation_button_color')?.value || '#d4af37',
          buttonTextColor: data.find(row => row.key === 'presentation_button_text_color')?.value || '#000000',
          showButton: data.find(row => row.key === 'presentation_show_button')?.value !== 'false',
          backgroundImage: data.find(row => row.key === 'presentation_background_image')?.value || '',
          backgroundColor: data.find(row => row.key === 'presentation_background_color')?.value || '#111827',
          overlayOpacity: data.find(row => row.key === 'presentation_overlay_opacity')?.value || '0.5',
          textAlign: data.find(row => row.key === 'presentation_text_align')?.value || 'center',
          maxWidth: data.find(row => row.key === 'presentation_max_width')?.value || '4xl',
          padding: data.find(row => row.key === 'presentation_padding')?.value || '20',
          visible: data.find(row => row.key === 'presentation_visible')?.value !== 'false'
        });
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundUpload = async () => {
    if (!backgroundFile) return '';

    setUploading(true);
    try {
      const fileExt = backgroundFile.name.split('.').pop();
      const fileName = `presentation-backgrounds/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(fileName, backgroundFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
      return '';
    } finally {
      setUploading(false);
    }
  };

  const savePresentationSettings = async () => {
    try {
      let backgroundImageUrl = presentation.backgroundImage;
      if (backgroundFile) {
        backgroundImageUrl = await handleBackgroundUpload();
        if (!backgroundImageUrl) return;
      }

      const settings = [
        { key: 'presentation_title', value: presentation.title },
        { key: 'presentation_title_color', value: presentation.titleColor },
        { key: 'presentation_title_size', value: presentation.titleSize },
        { key: 'presentation_subtitle', value: presentation.subtitle },
        { key: 'presentation_subtitle_color', value: presentation.subtitleColor },
        { key: 'presentation_subtitle_size', value: presentation.subtitleSize },
        { key: 'presentation_description', value: presentation.description },
        { key: 'presentation_description_color', value: presentation.descriptionColor },
        { key: 'presentation_description_size', value: presentation.descriptionSize },
        { key: 'presentation_button_text', value: presentation.buttonText },
        { key: 'presentation_button_link', value: presentation.buttonLink },
        { key: 'presentation_button_color', value: presentation.buttonColor },
        { key: 'presentation_button_text_color', value: presentation.buttonTextColor },
        { key: 'presentation_show_button', value: presentation.showButton ? 'true' : 'false' },
        { key: 'presentation_background_image', value: backgroundImageUrl },
        { key: 'presentation_background_color', value: presentation.backgroundColor },
        { key: 'presentation_overlay_opacity', value: presentation.overlayOpacity },
        { key: 'presentation_text_align', value: presentation.textAlign },
        { key: 'presentation_max_width', value: presentation.maxWidth },
        { key: 'presentation_padding', value: presentation.padding },
        { key: 'presentation_visible', value: presentation.visible ? 'true' : 'false' },
      ];

      const { error } = await supabase.from('settings').upsert(settings);
      if (error) throw error;
      
      setBackgroundFile(null);
      toast.success('Paramètres de présentation sauvegardés');
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
        <h2 className="text-2xl font-bold text-white mb-6">Section Présentation</h2>
        <p className="text-gray-400">Configurez la section de présentation qui apparaît après le Hero</p>
      </div>

      {/* Visibilité */}
      <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg">
        <input
          type="checkbox"
          id="visible"
          checked={presentation.visible}
          onChange={(e) => setPresentation(prev => ({ ...prev, visible: e.target.checked }))}
          className="w-5 h-5 text-gold bg-gray-700 border-gray-600 rounded focus:ring-gold focus:ring-2"
        />
        <label htmlFor="visible" className="flex items-center space-x-2 text-gray-300">
          {presentation.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          <span>Afficher la section présentation</span>
        </label>
      </div>

      {/* Contenu */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold flex items-center space-x-2">
          <Type className="w-6 h-6" />
          <span>Contenu</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Titre principal
            </label>
            <input
              type="text"
              value={presentation.title}
              onChange={(e) => setPresentation(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Titre de la section"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sous-titre
            </label>
            <input
              type="text"
              value={presentation.subtitle}
              onChange={(e) => setPresentation(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              placeholder="Sous-titre"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={presentation.description}
            onChange={(e) => setPresentation(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
            placeholder="Description détaillée..."
          />
        </div>
      </div>

      {/* Styles du texte */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold flex items-center space-x-2">
          <Palette className="w-6 h-6" />
          <span>Styles du Texte</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Titre */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Titre</h4>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Couleur</label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={presentation.titleColor}
                  onChange={(e) => setPresentation(prev => ({ ...prev, titleColor: e.target.value }))}
                  className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={presentation.titleColor}
                  onChange={(e) => setPresentation(prev => ({ ...prev, titleColor: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Taille</label>
              <input
                type="text"
                value={presentation.titleSize}
                onChange={(e) => setPresentation(prev => ({ ...prev, titleSize: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                placeholder="3rem"
              />
            </div>
          </div>

          {/* Sous-titre */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Sous-titre</h4>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Couleur</label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={presentation.subtitleColor}
                  onChange={(e) => setPresentation(prev => ({ ...prev, subtitleColor: e.target.value }))}
                  className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={presentation.subtitleColor}
                  onChange={(e) => setPresentation(prev => ({ ...prev, subtitleColor: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Taille</label>
              <input
                type="text"
                value={presentation.subtitleSize}
                onChange={(e) => setPresentation(prev => ({ ...prev, subtitleSize: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                placeholder="1.25rem"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Description</h4>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Couleur</label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={presentation.descriptionColor}
                  onChange={(e) => setPresentation(prev => ({ ...prev, descriptionColor: e.target.value }))}
                  className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={presentation.descriptionColor}
                  onChange={(e) => setPresentation(prev => ({ ...prev, descriptionColor: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Taille</label>
              <input
                type="text"
                value={presentation.descriptionSize}
                onChange={(e) => setPresentation(prev => ({ ...prev, descriptionSize: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                placeholder="1rem"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bouton */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold">Bouton d'Action</h3>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="showButton"
            checked={presentation.showButton}
            onChange={(e) => setPresentation(prev => ({ ...prev, showButton: e.target.checked }))}
            className="w-5 h-5 text-gold bg-gray-700 border-gray-600 rounded focus:ring-gold focus:ring-2"
          />
          <label htmlFor="showButton" className="text-gray-300">
            Afficher le bouton
          </label>
        </div>

        {presentation.showButton && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Texte du bouton
              </label>
              <input
                type="text"
                value={presentation.buttonText}
                onChange={(e) => setPresentation(prev => ({ ...prev, buttonText: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="En savoir plus"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lien du bouton
              </label>
              <input
                type="url"
                value={presentation.buttonLink}
                onChange={(e) => setPresentation(prev => ({ ...prev, buttonLink: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Couleur du bouton
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={presentation.buttonColor}
                  onChange={(e) => setPresentation(prev => ({ ...prev, buttonColor: e.target.value }))}
                  className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={presentation.buttonColor}
                  onChange={(e) => setPresentation(prev => ({ ...prev, buttonColor: e.target.value }))}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Couleur du texte
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={presentation.buttonTextColor}
                  onChange={(e) => setPresentation(prev => ({ ...prev, buttonTextColor: e.target.value }))}
                  className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={presentation.buttonTextColor}
                  onChange={(e) => setPresentation(prev => ({ ...prev, buttonTextColor: e.target.value }))}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Arrière-plan */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold flex items-center space-x-2">
          <Image className="w-6 h-6" />
          <span>Arrière-plan</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Couleur de fond
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={presentation.backgroundColor}
                onChange={(e) => setPresentation(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={presentation.backgroundColor}
                onChange={(e) => setPresentation(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image de fond
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
                className="flex-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-black hover:file:bg-gold/90"
              />
            </div>
            {presentation.backgroundImage && (
              <div className="mt-2">
                <img src={presentation.backgroundImage} alt="Aperçu" className="w-full h-20 object-cover rounded" />
              </div>
            )}
          </div>
        </div>

        {presentation.backgroundImage && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Opacité de l'overlay (0 = transparent, 1 = opaque)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={presentation.overlayOpacity}
              onChange={(e) => setPresentation(prev => ({ ...prev, overlayOpacity: e.target.value }))}
              className="w-full"
            />
            <div className="text-center text-gray-400 text-sm mt-1">{presentation.overlayOpacity}</div>
          </div>
        )}
      </div>

      {/* Mise en page */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gold">Mise en Page</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Alignement du texte
            </label>
            <select
              value={presentation.textAlign}
              onChange={(e) => setPresentation(prev => ({ ...prev, textAlign: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="left">Gauche</option>
              <option value="center">Centre</option>
              <option value="right">Droite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Largeur maximale
            </label>
            <select
              value={presentation.maxWidth}
              onChange={(e) => setPresentation(prev => ({ ...prev, maxWidth: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="sm">Small (24rem)</option>
              <option value="md">Medium (28rem)</option>
              <option value="lg">Large (32rem)</option>
              <option value="xl">Extra Large (36rem)</option>
              <option value="2xl">2X Large (42rem)</option>
              <option value="3xl">3X Large (48rem)</option>
              <option value="4xl">4X Large (56rem)</option>
              <option value="5xl">5X Large (64rem)</option>
              <option value="6xl">6X Large (72rem)</option>
              <option value="7xl">7X Large (80rem)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Espacement vertical (py-X)
            </label>
            <select
              value={presentation.padding}
              onChange={(e) => setPresentation(prev => ({ ...prev, padding: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="8">Petit (py-8)</option>
              <option value="12">Moyen (py-12)</option>
              <option value="16">Grand (py-16)</option>
              <option value="20">Très grand (py-20)</option>
              <option value="24">Extra grand (py-24)</option>
              <option value="32">Énorme (py-32)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aperçu */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gold">Aperçu</h3>
        <div 
          className="p-8 rounded-lg relative overflow-hidden"
          style={{
            backgroundColor: presentation.backgroundColor,
            backgroundImage: presentation.backgroundImage ? `url(${presentation.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {presentation.backgroundImage && (
            <div 
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${presentation.overlayOpacity})`
              }}
            />
          )}
          <div className={`relative z-10 text-${presentation.textAlign}`}>
            {presentation.title && (
              <h2 
                style={{ 
                  color: presentation.titleColor, 
                  fontSize: presentation.titleSize 
                }}
                className="font-bold mb-4"
              >
                {presentation.title}
              </h2>
            )}
            {presentation.subtitle && (
              <h3 
                style={{ 
                  color: presentation.subtitleColor, 
                  fontSize: presentation.subtitleSize 
                }}
                className="font-semibold mb-4"
              >
                {presentation.subtitle}
              </h3>
            )}
            {presentation.description && (
              <p 
                style={{ 
                  color: presentation.descriptionColor, 
                  fontSize: presentation.descriptionSize 
                }}
                className="mb-6 whitespace-pre-line"
              >
                {presentation.description}
              </p>
            )}
            {presentation.showButton && presentation.buttonText && (
              <button
                style={{
                  backgroundColor: presentation.buttonColor,
                  color: presentation.buttonTextColor
                }}
                className="px-6 py-3 font-semibold rounded-full"
              >
                {presentation.buttonText}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={savePresentationSettings}
          disabled={uploading}
          className="flex items-center space-x-2 px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200"
        >
          <Save className="w-5 h-5" />
          <span>{uploading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
        </button>
      </div>
    </div>
  );
};

export default PresentationSettings;