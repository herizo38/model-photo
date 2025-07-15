import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Send, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const { t } = useLanguage();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactLinks, setContactLinks] = useState<{ id: string; name: string; url: string }[]>([]);

  useEffect(() => {
    const fetchContactInfos = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', [
            'contact_phone', 'contact_email', 'contact_address', 'contact_links'
          ]);
        setContactPhone(data?.find((row) => row.key === 'contact_phone')?.value || '');
        setContactEmail(data?.find((row) => row.key === 'contact_email')?.value || '');
        setContactAddress(data?.find((row) => row.key === 'contact_address')?.value || '');
        // Liens dynamiques
        let links = [];
        try {
          links = JSON.parse(data?.find((row) => row.key === 'contact_links')?.value || '[]');
        } catch { }
        setContactLinks(Array.isArray(links) ? links : []);
      } catch { }
    };
    fetchContactInfos();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          ip_address: null, // Would be set by server in real implementation
          user_agent: navigator.userAgent
        }]);

      if (error) throw error;

      toast.success('Message sent successfully!');
      reset();
    } catch { }
  };

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            {t('contact_title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300"
          >
            Let's work together on your next project
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-black/50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-white mb-6">{t('get_in_touch') || 'Get in Touch'}</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-gold" />
                  <div>
                    <p className="text-white font-medium">{t('phone') || 'Phone'}</p>
                    <p className="text-gray-300">{contactPhone || '+1 (555) 123-4567'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-gold" />
                  <div>
                    <p className="text-white font-medium">{t('email') || 'Email'}</p>
                    <p className="text-gray-300">{contactEmail || 'hello@modelportfolio.com'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="w-6 h-6 text-gold" />
                  <div>
                    <p className="text-white font-medium">{t('location') || 'Location'}</p>
                    <p className="text-gray-300">{contactAddress || 'New York, NY'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="space-y-4">
              {contactLinks.length > 0 && contactLinks.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-4 bg-gold/20 hover:bg-gold/40 text-white rounded-lg transition-colors text-center font-medium"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-black/50 p-8 rounded-lg"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('name')}
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('email')}
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  {...register('subject', { required: 'Subject is required' })}
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="Project inquiry"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-400">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('message')}
                </label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  id="message"
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                  placeholder="Tell me about your project..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-[var(--color-button)] hover:bg-[var(--color-button)]/90 text-black font-semibold rounded-lg transition-all duration-200"
              >
                <Send className="w-5 h-5" />
                <span>{t('send_message')}</span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;