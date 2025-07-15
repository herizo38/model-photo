import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Upload,
  X,
  Save,
  Filter,
  Search
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Photo {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category_id: string;
  tags: string[];
  featured: boolean;
  views: number;
  clicks: number;
  shares: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface PhotoForm {
  title: string;
  description: string;
  image_url: string;
  category_id: string;
  tags: string;
  featured: boolean;
}

const PhotoManager: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PhotoForm>();

  useEffect(() => {
    fetchPhotos();
    fetchCategories();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      toast.error('Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const openModal = (photo?: Photo) => {
    if (photo) {
      setSelectedPhoto(photo);
      setIsEditing(true);
      setValue('title', photo.title);
      setValue('description', photo.description || '');
      setValue('image_url', photo.image_url);
      setValue('category_id', photo.category_id);
      setValue('tags', photo.tags.join(', '));
      setValue('featured', photo.featured);
    } else {
      setSelectedPhoto(null);
      setIsEditing(false);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
    setIsEditing(false);
    reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideo(e.target.files[0]);
    }
  };

  const onSubmit = async (data: PhotoForm) => {
    try {
      if (!selectedFile) {
        toast.error("Merci de sélectionner une image à uploader.");
        return;
      }
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase
        .storage
        .from('media')
        .upload(`photos/${fileName}`, selectedFile);
      if (uploadError) {
        toast.error("Erreur lors de l’upload du fichier image");
        return;
      }
      const { data: publicUrlData } = supabase
        .storage
        .from('media')
        .getPublicUrl(`photos/${fileName}`);
      const imageUrl = publicUrlData.publicUrl;

      // Upload vidéo si sélectionnée
      let videoUrl = '';
      if (selectedVideo) {
        const fileExt = selectedVideo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase
          .storage
          .from('media')
          .upload(`videos/${fileName}`, selectedVideo);
        if (uploadError) {
          toast.error("Erreur lors de l’upload de la vidéo");
          return;
        }
        const { data: publicUrlData } = supabase
          .storage
          .from('media')
          .getPublicUrl(`videos/${fileName}`);
        videoUrl = publicUrlData.publicUrl;
      }

      const photoData = {
        title: data.title,
        description: data.description,
        image_url: imageUrl,
        video_url: videoUrl,
        category_id: data.category_id,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        featured: data.featured,
      };
      if (isEditing && selectedPhoto) {
        await supabase
          .from('photos')
          .update(photoData)
          .eq('id', selectedPhoto.id);
        toast.success('Photo mise à jour avec succès');
      } else {
        await supabase
          .from('photos')
          .insert([photoData]);
        toast.success('Photo ajoutée avec succès');
      }
      fetchPhotos();
      closeModal();
      setSelectedFile(null);
      setSelectedVideo(null);
    } catch {
      toast.error('Échec de la sauvegarde de la photo');
    }
  };

  const deletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Photo deleted successfully');
      fetchPhotos();
    } catch (error) {
      toast.error('Failed to delete photo');
    }
  };

  const toggleFeatured = async (photo: Photo) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ featured: !photo.featured })
        .eq('id', photo.id);

      if (error) throw error;
      toast.success(`Photo ${!photo.featured ? 'featured' : 'unfeatured'}`);
      fetchPhotos();
    } catch (error) {
      toast.error('Failed to update photo');
    }
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || photo.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading photos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 pt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Photo Manager</h1>
            <p className="text-gray-400">Manage your portfolio photos</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 px-6 py-3 bg-[var(--color-button)] hover:bg-[var(--color-button)]/90 text-black font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Photo</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-gray-900 rounded-lg overflow-hidden"
            >
              <div className="aspect-square">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(photo)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFeatured(photo)}
                      className={`p-2 ${photo.featured ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-full transition-colors`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Featured Badge */}
              {photo.featured && (
                <div className="absolute top-2 right-2 bg-gold text-black px-2 py-1 rounded-full text-xs font-bold">
                  Featured
                </div>
              )}

              {/* Photo Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1 truncate">{photo.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{photo.views}</span>
                    </div>
                  </div>
                  <span>{new Date(photo.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Photo Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="max-w-2xl w-full max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white">
                    {isEditing ? 'Edit Photo' : 'Add Photo'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      {...register('title', { required: 'Title is required' })}
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="Photo title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                      placeholder="Photo description"
                    />
                  </div>

                  {/* Champ fichier image obligatoire */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fichier image (obligatoire)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      required
                    />
                    {selectedFile && (
                      <p className="mt-1 text-xs text-green-400">Fichier sélectionné : {selectedFile.name}</p>
                    )}
                  </div>

                  {/* Champ fichier vidéo optionnel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fichier vidéo (optionnel)
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    {selectedVideo && (
                      <p className="mt-1 text-xs text-green-400">Fichier sélectionné : {selectedVideo.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      {...register('category_id', { required: 'Category is required' })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="mt-1 text-sm text-red-400">{errors.category_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      {...register('tags')}
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="fashion, portrait, editorial"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      {...register('featured')}
                      type="checkbox"
                      id="featured"
                      className="w-4 h-4 text-gold bg-gray-800 border-gray-700 rounded focus:ring-gold focus:ring-2"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-300">
                      Featured photo (display on homepage)
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200"
                    >
                      <Save className="w-5 h-5" />
                      <span>{isEditing ? 'Update' : 'Add'} Photo</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PhotoManager;