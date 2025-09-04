import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Message {
  id: number;
  content: string;
  created_at: string;
  // Add other message properties as needed, e.g., author
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(messages || []);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ content: newMessage }]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container bg-gray-800 text-white p-4 rounded-lg">
      <div className="messages-list h-64 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div key={message.id} className="message mb-2">
            <p className="bg-gray-700 rounded-lg p-2 inline-block">{message.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="message-form flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="bg-gray-900 border border-gray-700 rounded-lg text-white p-2 flex-grow"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg ml-2">Send</button>
      </form>
    </div>
  );
};

export default Chat;
