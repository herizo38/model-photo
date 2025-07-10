import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Camera,
  MessageSquare,
  Users,
  Eye,
  MousePointer,
  Share2,
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalPhotos: number;
  totalViews: number;
  totalClicks: number;
  totalShares: number;
  unreadMessages: number;
  featuredPhotos: number;
  recentActivity: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPhotos: 0,
    totalViews: 0,
    totalClicks: 0,
    totalShares: 0,
    unreadMessages: 0,
    featuredPhotos: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Ajoute une fonction à appeler après modification des photos
  const handlePhotosChanged = () => {
    fetchDashboardStats();
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch photos stats
      const { data: photos } = await supabase
        .from('photos')
        .select('views, clicks, shares, featured, created_at');

      // Fetch messages stats
      const { data: messages } = await supabase
        .from('contact_messages')
        .select('status, created_at')
        .eq('status', 'unread');

      if (photos) {
        const totalViews = photos.reduce((sum, photo) => sum + (photo.views || 0), 0);
        const totalClicks = photos.reduce((sum, photo) => sum + (photo.clicks || 0), 0);
        const totalShares = photos.reduce((sum, photo) => sum + (photo.shares || 0), 0);
        const featuredPhotos = photos.filter(photo => photo.featured).length;

        setStats({
          totalPhotos: photos.length,
          totalViews,
          totalClicks,
          totalShares,
          unreadMessages: messages?.length || 0,
          featuredPhotos,
          recentActivity: photos.slice(0, 5)
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Photos',
      value: stats.totalPhotos,
      icon: Camera,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Clicks',
      value: stats.totalClicks.toLocaleString(),
      icon: MousePointer,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      title: 'Total Shares',
      value: stats.totalShares.toLocaleString(),
      icon: Share2,
      color: 'bg-pink-500',
      change: '+23%'
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'bg-orange-500',
      change: stats.unreadMessages > 0 ? 'New!' : ''
    },
    {
      title: 'Featured Photos',
      value: stats.featuredPhotos,
      icon: Star,
      color: 'bg-yellow-500',
      change: ''
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Dashboard
          </motion.h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your portfolio.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className={`text-sm mt-1 ${stat.change.includes('+') ? 'text-green-400' :
                        stat.change === 'New!' ? 'text-orange-400' : 'text-gray-400'
                      }`}>
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Performance Overview</h3>
              <BarChart3 className="w-5 h-5 text-gold" />
            </div>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
              <div className="text-center text-gray-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                <p>Chart visualization would go here</p>
                <p className="text-sm">Views, clicks, and shares over time</p>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Recent Activity</h3>
              <Calendar className="w-5 h-5 text-gold" />
            </div>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <Camera className="w-5 h-5 text-gold" />
                    <div className="flex-1">
                      <p className="text-white text-sm">Photo uploaded</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm">{activity.views || 0} views</p>
                      <p className="text-gray-400 text-xs">{activity.clicks || 0} clicks</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-2" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gray-900 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center space-x-2 p-4 bg-gold hover:bg-gold/90 text-black rounded-lg transition-colors">
              <Camera className="w-5 h-5" />
              <span>Add Photo</span>
            </button>
            <button className="flex items-center space-x-2 p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span>View Messages</span>
            </button>
            <button className="flex items-center space-x-2 p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button className="flex items-center space-x-2 p-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Users className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;