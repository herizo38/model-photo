import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Upload, Image, Save, Palette } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const GeneralSettings: React.FC = () => {
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [siteLogo, setSiteLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#d4af37');
  const [buttonColor, setButtonColor] = useState('#d4af37');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeneralSettings();
  }, []);

  const fetchGeneralSettings = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['site_title', 'site_description', 'site_logo', 'primary_color', 'button_color']);

      if (data) {
        setSiteTitle(data.find(row => row.key === 'site_title')?.value || '');
        setSiteDescription(data.find(row => row.key === 'site_description')?.value || '');
        setSiteLogo(data.find(row => row.key === 'site_logo')?.value || '');
        setPrimaryColor(data.find(row => row.key === 'primary_color')?.value || '#d4af37');
        setButtonColor(data.find(row => row.key === 'button_color')?.value || '#d4af37');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logos/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(fileName, logoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(fileName);

      setSiteLogo(urlData.publicUrl);
      toast.success('Logo uploadé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'upload du logo');
    } finally {
      setUploading(false);
    }
  };

  const saveGeneralSettings = async () => {
    try {
      const settings = [
        { key: 'site_title', value: siteTitle },
        { key: 'site_description', value: siteDescription },
        { key: 'site_logo', value: siteLogo },
        { key: 'primary_color', value: primaryColor },
        { key: 'button_color', value: buttonColor },
      ];

      const { error } = await supabase
        .from('settings')
        .upsert(settings);

      if (error) throw error;

      // Update CSS variables
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-button', buttonColor);

      toast.success('Paramètres sauvegardés avec succès');
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
        <h2 className="text-2xl font-bold text-white mb-6">Paramètres Généraux</h2>
      </div>

      {/* Site Info */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titre du site
          </label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            placeholder="Mon Portfolio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description du site
          </label>
          <textarea
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
            placeholder="Portfolio professionnel de modèle..."
          />
        </div>
      </div>

      {/* Logo Upload */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Logo du Site</h3>
        
        {siteLogo && (
          <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
            <img src={siteLogo} alt="Logo actuel" className="w-16 h-16 object-contain rounded" />
            <div>
              <p className="text-white font-medium">Logo actuel</p>
              <p className="text-gray-400 text-sm">Cliquez sur "Choisir un fichier" pour le remplacer</p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*,.svg"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-black hover:file:bg-gold/90"
            />
          </div>
          <button
            onClick={handleLogoUpload}
            disabled={!logoFile || uploading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>{uploading ? 'Upload...' : 'Upload'}</span>
          </button>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <Palette className="w-6 h-6" />
          <span>Couleurs du Site</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Couleur principale (or)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="#d4af37"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Couleur des boutons
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={buttonColor}
                onChange={(e) => setButtonColor(e.target.value)}
                className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={buttonColor}
                onChange={(e) => setButtonColor(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="#d4af37"
              />
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <h4 className="text-white font-medium mb-4">Aperçu des couleurs</h4>
          <div className="flex items-center space-x-4">
            <div
              className="px-6 py-3 rounded-lg font-semibold text-black"
              style={{ backgroundColor: primaryColor }}
            >
              Couleur principale
            </div>
            <div
              className="px-6 py-3 rounded-lg font-semibold text-black"
              style={{ backgroundColor: buttonColor }}
            >
              Couleur bouton
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveGeneralSettings}
          className="flex items-center space-x-2 px-8 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200"
        >
          <Save className="w-5 h-5" />
          <span>Sauvegarder les Paramètres</span>
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;