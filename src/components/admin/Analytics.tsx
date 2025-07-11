import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MousePointer,
  Share2,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
// import { fr } from 'date-fns/locale'; // supprimé car inutilisé

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalShares: number;
  uniqueVisitors: number;
  topPhotos: Array<{
    id: string;
    title: string;
    views: number;
    clicks: number;
    shares: number;
  }>;
  viewsByDay: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locationStats: Array<{
    country: string;
    city: string;
    count: number;
  }>;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    totalShares: 0,
    uniqueVisitors: 0,
    topPhotos: [],
    viewsByDay: [],
    deviceStats: { desktop: 0, mobile: 0, tablet: 0 },
    locationStats: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(7); // Last 7 days
  const [blockedStats, setBlockedStats] = useState<{ total: number; byCountry: Array<{ country: string; count: number }> }>({ total: 0, byCountry: [] });
  const [visitorDetails, setVisitorDetails] = useState<Array<{ ip: string; country: string; city: string; device: string; date: string }>>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchBlockedStats();
    fetchVisitorDetails();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const startDate = startOfDay(subDays(new Date(), dateRange));
      const endDate = endOfDay(new Date());

      // Fetch photos with stats
      const { data: photos } = await supabase
        .from('photos')
        .select('id, title, views, clicks, shares')
        .order('views', { ascending: false });

      // Fetch click data for detailed analytics
      const { data: clicks } = await supabase
        .from('url_clicks')
        .select('*')
        .gte('clicked_at', startDate.toISOString())
        .lte('clicked_at', endDate.toISOString());

      if (photos) {
        const totalViews = photos.reduce((sum, photo) => sum + (photo.views || 0), 0);
        const totalClicks = photos.reduce((sum, photo) => sum + (photo.clicks || 0), 0);
        const totalShares = photos.reduce((sum, photo) => sum + (photo.shares || 0), 0);

        // Generate daily stats
        const viewsByDay = [];
        for (let i = dateRange - 1; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dayClicks = clicks?.filter(click =>
            format(new Date(click.clicked_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          ).length || 0;

          viewsByDay.push({
            date: format(date, 'dd/MM'),
            views: Math.floor(Math.random() * 100) + dayClicks, // Simulated views
            clicks: dayClicks
          });
        }

        // Device stats from clicks
        const deviceStats = {
          desktop: clicks?.filter(click => click.device?.toLowerCase().includes('desktop')).length || 0,
          mobile: clicks?.filter(click => click.device?.toLowerCase().includes('mobile')).length || 0,
          tablet: clicks?.filter(click => click.device?.toLowerCase().includes('tablet')).length || 0
        };

        // Location stats
        const locationMap = new Map();
        clicks?.forEach(click => {
          if (click.location_country && click.location_city) {
            const key = `${click.location_country}-${click.location_city}`;
            locationMap.set(key, (locationMap.get(key) || 0) + 1);
          }
        });

        const locationStats = Array.from(locationMap.entries())
          .map(([key, count]) => {
            const [country, city] = key.split('-');
            return { country, city, count };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setAnalytics({
          totalViews,
          totalClicks,
          totalShares,
          uniqueVisitors: new Set(clicks?.map(click => click.ip) || []).size,
          topPhotos: photos.slice(0, 5),
          viewsByDay,
          deviceStats,
          locationStats
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction pour charger les stats de blocage
  const fetchBlockedStats = async () => {
    const startDate = startOfDay(subDays(new Date(), dateRange));
    const endDate = endOfDay(new Date());
    const { data: logs } = await supabase
      .from('geo_block_logs')
      .select('country_code')
      .gte('blocked_at', startDate.toISOString())
      .lte('blocked_at', endDate.toISOString());
    if (!logs) return setBlockedStats({ total: 0, byCountry: [] });
    const total = logs.length;
    const countryMap = new Map<string, number>();
    logs.forEach(log => {
      if (log.country_code) {
        countryMap.set(log.country_code, (countryMap.get(log.country_code) || 0) + 1);
      }
    });
    const byCountry = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    setBlockedStats({ total, byCountry });
  };

  // Nouvelle fonction pour charger le détail des visiteurs
  const fetchVisitorDetails = async () => {
    const startDate = startOfDay(subDays(new Date(), dateRange));
    const endDate = endOfDay(new Date());
    const { data: clicks } = await supabase
      .from('url_clicks')
      .select('ip, location_country, location_city, device, clicked_at')
      .gte('clicked_at', startDate.toISOString())
      .lte('clicked_at', endDate.toISOString())
      .order('clicked_at', { ascending: false })
      .limit(50);
    if (!clicks) return setVisitorDetails([]);
    setVisitorDetails(
      clicks.map(click => ({
        ip: click.ip || '',
        country: click.location_country || '',
        city: click.location_city || '',
        device: click.device || '',
        date: click.clicked_at ? format(new Date(click.clicked_at), 'dd/MM/yyyy HH:mm') : '',
      }))
    );
  };

  const exportData = () => {
    const csvContent = [
      ['Métrique', 'Valeur'],
      ['Vues totales', analytics.totalViews],
      ['Clics totaux', analytics.totalClicks],
      ['Partages totaux', analytics.totalShares],
      ['Visiteurs uniques', analytics.uniqueVisitors],
      [''],
      ['Top Photos', ''],
      ...analytics.topPhotos.map(photo => [photo.title, `${photo.views} vues`]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement des analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400">Analysez les performances de votre portfolio</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value={7}>7 derniers jours</option>
              <option value={30}>30 derniers jours</option>
              <option value={90}>90 derniers jours</option>
            </select>
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Vues totales', value: analytics.totalViews.toLocaleString(), icon: Eye, color: 'bg-blue-500' },
            { title: 'Clics totaux', value: analytics.totalClicks.toLocaleString(), icon: MousePointer, color: 'bg-green-500' },
            { title: 'Partages', value: analytics.totalShares.toLocaleString(), icon: Share2, color: 'bg-purple-500' },
            { title: 'Visiteurs uniques', value: analytics.uniqueVisitors.toLocaleString(), icon: Users, color: 'bg-orange-500' },
          ].map((stat, index) => (
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
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Views Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Évolution des vues</h3>
              <TrendingUp className="w-5 h-5 text-gold" />
            </div>
            <div className="space-y-4">
              {analytics.viewsByDay.map((day, index) => (
                <div key={day.date} className="flex items-center space-x-4">
                  <span className="text-gray-400 text-sm w-12">{day.date}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gold h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max((day.views / Math.max(...analytics.viewsByDay.map(d => d.views))) * 100, 5)}%`
                      }}
                    />
                  </div>
                  <span className="text-white text-sm w-12 text-right">{day.views}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Photos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Photos les plus vues</h3>
              <BarChart3 className="w-5 h-5 text-gold" />
            </div>
            <div className="space-y-4">
              {analytics.topPhotos.map((photo, index) => (
                <div key={photo.id} className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gold text-black rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium truncate">{photo.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{photo.views} vues</span>
                      <span>{photo.clicks} clics</span>
                      <span>{photo.shares} partages</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Appareils utilisés</h3>
              <Smartphone className="w-5 h-5 text-gold" />
            </div>
            <div className="space-y-4">
              {[
                { name: 'Desktop', count: analytics.deviceStats.desktop, icon: Monitor },
                { name: 'Mobile', count: analytics.deviceStats.mobile, icon: Smartphone },
                { name: 'Tablet', count: analytics.deviceStats.tablet, icon: Monitor },
              ].map((device) => {
                const total = Object.values(analytics.deviceStats).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (device.count / total) * 100 : 0;

                return (
                  <div key={device.name} className="flex items-center space-x-4">
                    <device.icon className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white">{device.name}</span>
                        <span className="text-gray-400 text-sm">{device.count}</span>
                      </div>
                      <div className="bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gold h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Location Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Localisation des visiteurs</h3>
              <Globe className="w-5 h-5 text-gold" />
            </div>
            <div className="space-y-3">
              {analytics.locationStats.length > 0 ? (
                analytics.locationStats.map((location, i) => (
                  <div key={`${location.country}-${location.city}`} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-gold font-bold text-sm w-6">{i + 1}</span>
                      <div>
                        <span className="text-white">{location.city}</span>
                        <span className="text-gray-400 text-sm ml-2">{location.country}</span>
                      </div>
                    </div>
                    <span className="text-gray-400">{location.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Aucune donnée de localisation</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Visiteurs bloqués */}
        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Visiteurs bloqués</h3>
              <Globe className="w-5 h-5 text-gold" />
            </div>
            <div className="mb-4">
              <span className="text-white text-2xl font-bold">{blockedStats.total}</span>
              <span className="text-gray-400 ml-2">blocages sur la période</span>
            </div>
            <div className="space-y-3">
              {blockedStats.byCountry.length > 0 ? (
                blockedStats.byCountry.map((item, idx) => (
                  <div key={item.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-gold font-bold text-sm w-6">{idx + 1}</span>
                      <span className="text-white">{item.country}</span>
                    </div>
                    <span className="text-gray-400">{item.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Aucun visiteur bloqué sur la période</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Détail des visiteurs */}
        <div className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Détail des visiteurs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="py-2 px-3">IP</th>
                    <th className="py-2 px-3">Pays</th>
                    <th className="py-2 px-3">Ville</th>
                    <th className="py-2 px-3">Device</th>
                    <th className="py-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visitorDetails.length > 0 ? (
                    visitorDetails.map((v, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                        <td className="py-2 px-3 text-white font-mono">{v.ip}</td>
                        <td className="py-2 px-3 text-white">{v.country}</td>
                        <td className="py-2 px-3 text-white">{v.city}</td>
                        <td className="py-2 px-3 text-white">{v.device}</td>
                        <td className="py-2 px-3 text-white">{v.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">Aucune donnée sur la période</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;