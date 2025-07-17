import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Upload, Save, Palette } from 'lucide-react';
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
  const [instagramUrl, setInstagramUrl] = useState('');
  // Ajout de nouveaux états pour d'autres couleurs
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontFamilyTitle, setFontFamilyTitle] = useState('playfair');
  const [fontFamilyText, setFontFamilyText] = useState('cormorant');

  useEffect(() => {
    fetchGeneralSettings();
  }, []);

  const fetchGeneralSettings = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['site_title', 'site_description', 'site_logo', 'primary_color', 'button_color', 'background_color', 'text_color', 'font_family_title', 'font_family_text','geoblock_instagram_url']);

      if (data) {
        setSiteTitle(data.find(row => row.key === 'site_title')?.value || '');
        setSiteDescription(data.find(row => row.key === 'site_description')?.value || '');
        setSiteLogo(data.find(row => row.key === 'site_logo')?.value || '');
        setPrimaryColor(data.find(row => row.key === 'primary_color')?.value || '#d4af37');
        setButtonColor(data.find(row => row.key === 'button_color')?.value || '#d4af37');
        setBackgroundColor(data.find(row => row.key === 'background_color')?.value || '#000000');
        setTextColor(data.find(row => row.key === 'text_color')?.value || '#ffffff');
        setFontFamilyTitle(data.find(row => row.key === 'font_family_title')?.value || 'playfair');
        setFontFamilyText(data.find(row => row.key === 'font_family_text')?.value || 'cormorant');
        setInstagramUrl(data.find(row => row.key === 'geoblock_instagram_url')?.value || '');
      }
    } catch {
      toast.error('Failed to load settings');
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
      toast.success('Logo uploaded successfully');
    } catch {
      toast.error('Error uploading logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!siteLogo) return;
    if (!window.confirm('Supprimer le logo du site ?')) return;
    setUploading(true);
    try {
      // Extraire le chemin du fichier à partir de l'URL publique
      const match = siteLogo.match(/\/storage\/v1\/object\/public\/([^?]+)/);
      const filePath = match ? decodeURIComponent(match[1]) : null;
      if (filePath) {
        // Tente de supprimer le fichier du bucket 'logos'
        await supabase.storage.from('logos').remove([filePath]);
      }
      // Efface la valeur dans settings
      await supabase.from('settings').upsert([{ key: 'site_logo', value: '' }]);
      setSiteLogo('');
      toast.success('Logo supprimé');
    } catch {
      toast.error('Erreur lors de la suppression du logo');
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
        { key: 'geoblock_instagram_url', value: instagramUrl },
        { key: 'background_color', value: backgroundColor },
        { key: 'text_color', value: textColor },
        { key: 'font_family_title', value: fontFamilyTitle },
        { key: 'font_family_text', value: fontFamilyText },
      ];

      const { error } = await supabase
        .from('settings')
        .upsert(settings);

      if (error) throw error;

      // Met à jour les variables CSS globales
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-button', buttonColor);
      document.documentElement.style.setProperty('--color-background', backgroundColor);
      document.documentElement.style.setProperty('--color-text', textColor);

      toast.success('Settings saved successfully');
    } catch {
      toast.error('Error saving settings');
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>
      </div>

      {/* Site Info */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Site Title
          </label>
          <input
            type="text"
            value={siteTitle}
            onChange={(e) => setSiteTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            placeholder="My Portfolio"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Site Description
          </label>
          <textarea
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
            placeholder="Professional portfolio model..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lien Instagram (pour la page de géoblocage)
          </label>
          <input
            type="url"
            value={instagramUrl}
            onChange={e => setInstagramUrl(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            placeholder="https://instagram.com/toncompte"
          />
        </div>
      </div>

      {/* Logo Upload */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Site Logo</h3>

        {siteLogo && (
          <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
            <img src={siteLogo} alt="Current Logo" className="w-16 h-16 object-contain rounded" />
            <div>
              <p className="text-white font-medium">Current Logo</p>
              <p className="text-gray-400 text-sm">Click "Choose File" to replace it</p>
            </div>
            <button
              onClick={handleDeleteLogo}
              disabled={uploading}
              className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Supprimer
            </button>
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
            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
          </button>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <Palette className="w-6 h-6" />
          <span>Site Colors</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Couleur principale et bouton existantes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Primary Color (Gold)
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
              Button Color
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
          {/* Couleur de fond */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Background Color
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="#000000"
              />
            </div>
          </div>
          {/* Couleur du texte */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Text Color
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-16 h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        {/* Color Preview */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <h4 className="text-white font-medium mb-4">Color Preview</h4>
          <div className="flex items-center space-x-4">
            <div
              className="px-6 py-3 rounded-lg font-semibold text-black"
              style={{ backgroundColor: primaryColor }}
            >
              Primary Color
            </div>
            <div
              className="px-6 py-3 rounded-lg font-semibold text-black"
              style={{ backgroundColor: buttonColor }}
            >
              Button Color
            </div>
          </div>
        </div>
      </div>

      {/* Police du site */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Polices du site</h3>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Police des titres</label>
          <select
            value={fontFamilyTitle}
            onChange={e => setFontFamilyTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          >
            <option value="playfair">Playfair Display</option>
            <option value="didot">Didot</option>
            <option value="bodoni">Bodoni Moda</option>
            <option value="cormorant">Cormorant Garamond</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Police du texte</label>
          <select
            value={fontFamilyText}
            onChange={e => setFontFamilyText(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          >
            <option value="playfair">Playfair Display</option>
            <option value="didot">Didot</option>
            <option value="bodoni">Bodoni Moda</option>
            <option value="cormorant">Cormorant Garamond</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveGeneralSettings}
          className="flex items-center space-x-2 px-8 py-3 bg-[var(--color-button)] hover:bg-[var(--color-button)]/90 text-black font-semibold rounded-lg transition-all duration-200"
        >
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;