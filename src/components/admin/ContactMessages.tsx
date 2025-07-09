import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Trash2, 
  Reply, 
  Search,
  Filter,
  Calendar,
  User,
  Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: 'read' | 'replied') => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === id ? { ...msg, status } : msg
        )
      );
      
      toast.success(`Message marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update message status');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMessages(prev => prev.filter(msg => msg.id !== id));
      setSelectedMessage(null);
      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-500';
      case 'read': return 'bg-yellow-500';
      case 'replied': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unread': return 'Non lu';
      case 'read': return 'Lu';
      case 'replied': return 'Répondu';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement des messages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Messages de Contact</h1>
          <p className="text-gray-400">Gérez les messages reçus via le formulaire de contact</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="unread">Non lus</option>
              <option value="read">Lus</option>
              <option value="replied">Répondus</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h2 className="text-xl font-bold text-white mb-4">
                Messages ({filteredMessages.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedMessage?.id === message.id
                        ? 'bg-gold/20 border border-gold'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{message.name}</h3>
                        <p className="text-gray-400 text-sm truncate">{message.email}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(message.status)}`} />
                    </div>
                    <p className="text-gray-300 text-sm font-medium mb-1 truncate">
                      {message.subject}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </motion.div>
                ))}
                {filteredMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Aucun message trouvé</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900 rounded-lg p-6"
              >
                {/* Message Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">{selectedMessage.subject}</h2>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(selectedMessage.status)}`}>
                        {getStatusText(selectedMessage.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-400 text-sm">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{selectedMessage.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{selectedMessage.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(selectedMessage.created_at), 'dd/MM/yyyy à HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {selectedMessage.status === 'unread' && (
                      <button
                        onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                        className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                        title="Marquer comme lu"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {selectedMessage.status !== 'replied' && (
                      <button
                        onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        title="Marquer comme répondu"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Content */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-white font-medium mb-3">Message:</h3>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Technical Info */}
                {(selectedMessage.ip_address || selectedMessage.user_agent) && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Informations techniques:</h3>
                    <div className="space-y-2 text-sm">
                      {selectedMessage.ip_address && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Adresse IP:</span>
                          <span className="text-gray-300">{selectedMessage.ip_address}</span>
                        </div>
                      )}
                      {selectedMessage.user_agent && (
                        <div className="flex items-start space-x-2">
                          <span className="text-gray-400 mt-1">User Agent:</span>
                          <span className="text-gray-300 break-all">{selectedMessage.user_agent}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Répondre par email</span>
                  </a>
                  <a
                    href={`https://wa.me/?text=Bonjour ${selectedMessage.name}, merci pour votre message concernant "${selectedMessage.subject}".`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-900 rounded-lg p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Sélectionnez un message</h3>
                <p className="text-gray-400">Choisissez un message dans la liste pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;