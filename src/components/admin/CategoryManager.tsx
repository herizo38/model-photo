import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Palette,
  Tag
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  name_fr: string;
  name_en: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface CategoryForm {
  name: string;
  name_fr: string;
  name_en: string;
  description: string;
  color: string;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryForm>();

  const predefinedColors = [
    '#d4af37', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6',
    '#f39c12', '#1abc9c', '#34495e', '#e67e22', '#95a5a6'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setIsEditing(true);
      setValue('name', category.name);
      setValue('name_fr', category.name_fr);
      setValue('name_en', category.name_en);
      setValue('description', category.description || '');
      setValue('color', category.color);
    } else {
      setSelectedCategory(null);
      setIsEditing(false);
      reset({
        name: '',
        name_fr: '',
        name_en: '',
        description: '',
        color: '#d4af37'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setIsEditing(false);
    reset();
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      const categoryData = {
        name: data.name,
        name_fr: data.name_fr,
        name_en: data.name_en,
        description: data.description,
        color: data.color,
      };

      if (isEditing && selectedCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', selectedCategory.id);

        if (error) throw error;
        toast.success('Catégorie mise à jour avec succès');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) throw error;
        toast.success('Catégorie ajoutée avec succès');
      }

      fetchCategories();
      closeModal();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Catégorie supprimée avec succès');
      fetchCategories();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement des catégories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestion des Catégories</h1>
            <p className="text-gray-400">Organisez vos photos par catégories</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter une Catégorie</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 rounded-lg p-6 group hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="text-white font-semibold">{category.name}</h3>
                    <div className="text-sm text-gray-400">
                      <span>FR: {category.name_fr}</span> • <span>EN: {category.name_en}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(category)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-gray-300 text-sm mb-4">{category.description}</p>
              )}
              
              <div className="text-xs text-gray-500">
                Créée le {new Date(category.created_at).toLocaleDateString('fr-FR')}
              </div>
            </motion.div>
          ))}
          
          {categories.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Aucune catégorie</h3>
              <p className="text-gray-400 mb-6">Commencez par créer votre première catégorie</p>
              <button
                onClick={() => openModal()}
                className="px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-colors"
              >
                Créer une catégorie
              </button>
            </div>
          )}
        </div>

        {/* Category Modal */}
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
                    {isEditing ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
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
                      Nom de la catégorie
                    </label>
                    <input
                      {...register('name', { required: 'Le nom est requis' })}
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="Nom de la catégorie"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom en français
                      </label>
                      <input
                        {...register('name_fr', { required: 'Le nom en français est requis' })}
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="Nom en français"
                      />
                      {errors.name_fr && (
                        <p className="mt-1 text-sm text-red-400">{errors.name_fr.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom en anglais
                      </label>
                      <input
                        {...register('name_en', { required: 'Le nom en anglais est requis' })}
                        type="text"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="English name"
                      />
                      {errors.name_en && (
                        <p className="mt-1 text-sm text-red-400">{errors.name_en.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description (optionnelle)
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                      placeholder="Description de la catégorie"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Palette className="w-4 h-4 inline mr-2" />
                      Couleur
                    </label>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setValue('color', color)}
                          className="w-8 h-8 rounded-full border-2 border-gray-600 hover:border-white transition-colors"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      {...register('color', { required: 'La couleur est requise' })}
                      type="color"
                      className="w-full h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gold hover:bg-gold/90 text-black font-semibold rounded-lg transition-all duration-200"
                    >
                      <Save className="w-5 h-5" />
                      <span>{isEditing ? 'Mettre à jour' : 'Ajouter'}</span>
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

export default CategoryManager;