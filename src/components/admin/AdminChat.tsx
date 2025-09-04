import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

// Define types for our data
interface Conversation {
  id: string;
  client_id: string;
  created_at: string;
  status: 'open' | 'closed';
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
}

const AdminChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
      } else {
        setConversations(data as Conversation[]);
      }
      setLoading(false);
    };

    fetchConversations();
  }, []);

  // Fetch messages for the selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', selectedConversation.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          setMessages(data as Message[]);
        }
      };

      fetchMessages();

      // Subscribe to new messages
      const messageSubscription = supabase
        .channel(`messages:${selectedConversation.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation.id}` },
          (payload) => {
            setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageSubscription);
      };
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const moderatorId = 'moderator';

    const { error } = await supabase.from('messages').insert({
      content: newMessage,
      conversation_id: selectedConversation.id,
      sender_id: moderatorId,
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  if (loading) {
    return <div className="text-white p-8">Loading conversations...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-900 text-white">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-bold p-4 border-b border-gray-700">Conversations</h2>
        {conversations.map((convo) => (
          <div
            key={convo.id}
            onClick={() => setSelectedConversation(convo)}
            className={`p-4 cursor-pointer hover:bg-gray-800 ${selectedConversation?.id === convo.id ? 'bg-gray-800' : ''}`}
          >
            <p className="font-semibold">Client: {convo.client_id}</p>
            <p className="text-sm text-gray-400">{new Date(convo.created_at).toLocaleString()}</p>
            <span
              className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                convo.status === 'open' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {convo.status}
            </span>
          </div>
        ))}
      </div>

      {/* Message Area */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold">Chat with Client {selectedConversation.client_id}</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 p-3 rounded-lg max-w-lg ${
                    msg.sender_id === 'moderator' ? 'bg-gold text-black ml-auto' : 'bg-gray-700 text-white'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-70 block text-right mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 text-white rounded-l-lg px-4 py-2 focus:outline-none"
              />
              <button type="submit" className="bg-gold text-black font-semibold px-6 py-2 rounded-r-lg">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
