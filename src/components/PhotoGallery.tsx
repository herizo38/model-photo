import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Share2, Heart, Filter } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useLanguage } from '../contexts/LanguageContext';
import { Photo } from '../types';
import { supabase } from '../lib/supabase';

interface PhotoGalleryProps {
  photos?: Photo[];
  showFilters?: boolean;
  limit?: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos = [],
  showFilters = true,
  limit
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [dbPhotos, setDbPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          categories (
            name,
            name_en,
            name_fr
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPhotos: Photo[] = (data || []).map(photo => ({
        id: photo.id,
        title: photo.title,
        description: photo.description,
        image_url: photo.image_url,
        category: photo.categories?.name || 'uncategorized',
        tags: photo.tags || [],
        featured: photo.featured,
        created_at: photo.created_at,
        views: photo.views,
        clicks: photo.clicks,
        shares: photo.shares,
      }));

      setDbPhotos(formattedPhotos);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample photos for demo
  const samplePhotos: Photo[] = [
    {
      id: '1',
      title: 'Fashion Editorial',
      description: 'Vogue Magazine Shoot',
      image_url: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'fashion',
      tags: ['editorial', 'fashion', 'magazine'],
      featured: true,
      created_at: '2024-01-15',
      views: 1250,
      clicks: 89,
      shares: 23,
    },
    {
      id: '2',
      title: 'Portrait Session',
      description: 'Studio Photography',
      image_url: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'portraits',
      tags: ['portrait', 'studio', 'professional'],
      featured: false,
      created_at: '2024-01-14',
      views: 892,
      clicks: 67,
      shares: 15,
    },
    {
      id: '3',
      title: 'Commercial Campaign',
      description: 'Brand Collaboration',
      image_url: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'commercial',
      tags: ['commercial', 'brand', 'campaign'],
      featured: true,
      created_at: '2024-01-13',
      views: 1456,
      clicks: 102,
      shares: 31,
    },
    {
      id: '4',
      title: 'Street Style',
      description: 'Urban Photography',
      image_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'editorial',
      tags: ['street', 'urban', 'lifestyle'],
      featured: false,
      created_at: '2024-01-12',
      views: 734,
      clicks: 45,
      shares: 12,
    },
    {
      id: '5',
      title: 'Beauty Close-up',
      description: 'Cosmetic Shoot',
      image_url: 'https://images.pexels.com/photos/1462980/pexels-photo-1462980.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'portraits',
      tags: ['beauty', 'closeup', 'cosmetic'],
      featured: true,
      created_at: '2024-01-11',
      views: 1123,
      clicks: 78,
      shares: 19,
    },
    {
      id: '6',
      title: 'Runway Model',
      description: 'Fashion Week',
      image_url: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'fashion',
      tags: ['runway', 'fashion week', 'haute couture'],
      featured: false,
      created_at: '2024-01-10',
      views: 987,
      clicks: 56,
      shares: 18,
    },
  ];

  const displayPhotos = photos.length > 0 ? photos : (dbPhotos.length > 0 ? dbPhotos : samplePhotos);

  const categories = [
    { id: 'all', name: t('all_categories') },
    { id: 'portraits', name: t('portraits') },
    { id: 'fashion', name: t('fashion') },
    { id: 'editorial', name: t('editorial') },
    { id: 'commercial', name: t('commercial') },
  ];

  useEffect(() => {
    let filtered = displayPhotos;

    if (selectedCategory !== 'all') {
      filtered = displayPhotos.filter(photo => photo.category === selectedCategory);
    }

    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    setFilteredPhotos(filtered);
  }, [selectedCategory, displayPhotos, limit]);

  const incrementViews = async (photoId: string) => {
    try {
      await supabase.rpc('increment_photo_views', { photo_id: photoId });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const PhotoCard: React.FC<{ photo: Photo; index: number }> = ({ photo, index }) => {
    const { ref, inView } = useInView({
      threshold: 0.1,
      triggerOnce: true,
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative overflow-hidden rounded-lg bg-black cursor-pointer"
        onClick={() => {
          setSelectedPhoto(photo);
          incrementViews(photo.id);
        }}
      >
        <div className="aspect-square">
          <img
            src={photo.image_url}
            alt={photo.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-lg font-bold mb-1">{photo.title}</h3>
              <p className="text-sm text-gray-300 mb-4">{photo.description}</p>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{photo.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{photo.clicks}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">{photo.shares}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Badge */}
        {photo.featured && (
          <div className="absolute top-2 right-2 bg-gold text-black px-2 py-1 rounded-full text-xs font-bold">
            A la une
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      {/* {showFilters && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">Filter by:</span>
          </div>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${selectedCategory === category.id
                ? 'bg-gold text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )} */}

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo, index) => (
          <PhotoCard key={photo.id} photo={photo} index={index} />
        ))}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-4xl w-full max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.title}
                  className="w-full h-auto"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 text-white hover:text-gold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedPhoto.title}</h2>
                <p className="text-gray-300 mb-4">{selectedPhoto.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{selectedPhoto.views} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{selectedPhoto.clicks} likes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="w-4 h-4" />
                    <span>{selectedPhoto.shares} shares</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoGallery;