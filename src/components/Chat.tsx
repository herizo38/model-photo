import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

// Define types for our data
interface Message {
  id: number;
  content: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  // Get or create conversation on component mount
  useEffect(() => {
    const initializeChat = async () => {
      let storedClientId = localStorage.getItem('supabase_chat_client_id');
      if (!storedClientId) {
        storedClientId = `client_${Date.now()}`;
        localStorage.setItem('supabase_chat_client_id', storedClientId);
      }
      setClientId(storedClientId);

      let storedConvId = localStorage.getItem('supabase_chat_conversation_id');
      if (storedConvId) {
        setConversationId(storedConvId);
      } else {
        const { data, error } = await supabase
          .from('conversations')
          .insert({ client_id: storedClientId })
          .select('id')
          .single();
        
        if (error) {
          console.error('Error creating conversation:', error);
        } else if (data) {
          const newConvId = data.id;
          localStorage.setItem('supabase_chat_conversation_id', newConvId);
          setConversationId(newConvId);
        }
      }
    };

    initializeChat();
  }, []);

  // Fetch messages and subscribe to real-time updates
  useEffect(() => {
    if (conversationId) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          setMessages(data as Message[]);
        }
      };

      fetchMessages();

      const messageSubscription = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageSubscription);
      };
    }
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !clientId) return;

    const { error } = await supabase.from('messages').insert({
      content: newMessage,
      conversation_id: conversationId,
      sender_id: clientId,
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-900/50 backdrop-blur-md rounded-lg shadow-lg overflow-hidden" style={{ height: '70vh' }}>
        <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white text-center">Live Chat</h2>
        </div>
        <div className="messages-list flex-1 p-4 overflow-y-auto" style={{ height: 'calc(70vh - 120px)' }}>
            {messages.map((msg) => (
            <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 flex ${msg.sender_id === clientId ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender_id === clientId ? 'bg-gold text-black' : 'bg-gray-700 text-white'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-xs opacity-70 block text-right mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </motion.div>
            ))}
             <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex items-center">
            <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 bg-gray-800 text-white rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button type="submit" className="bg-gold text-black font-semibold px-5 py-2 rounded-r-full hover:bg-yellow-400 transition-colors">
            Envoyer
            </button>
        </form>
    </div>
  );
};

export default Chat;
