import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

const ContactSettings: React.FC = () => {
    const [intro, setIntro] = useState('');
    const [loading, setLoading] = useState(true);
    const [showSocialHero, setShowSocialHero] = useState(true);
    // Préparation pour les liens de contact (sera complété ensuite)
    type ContactLink = { id: string; name: string; url: string; icon: string; visible: boolean };
    const [links, setLinks] = useState<ContactLink[]>([]);

    useEffect(() => {
        fetchContactSettings();
    }, []);

    const fetchContactSettings = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('settings')
            .select('key, value')
            .in('key', ['contact_intro', 'contact_links', 'show_social_hero']);
        setIntro(data?.find((row) => row.key === 'contact_intro')?.value || '');
        setShowSocialHero(data?.find((row) => row.key === 'show_social_hero')?.value !== 'false');
        let linksArr = [];
        try { linksArr = JSON.parse(data?.find((row) => row.key === 'contact_links')?.value || '[]'); } catch { linksArr = []; }
        setLinks(Array.isArray(linksArr) ? linksArr : []);
        setLoading(false);
    };

    const saveIntro = async (e: React.FormEvent) => {
        e.preventDefault();
        await supabase.from('settings').upsert({ key: 'contact_intro', value: intro });
        toast.success('Texte de contact sauvegardé !');
    };

    const saveShowSocialHero = async () => {
        await supabase.from('settings').upsert({ key: 'show_social_hero', value: showSocialHero ? 'true' : 'false' });
        toast.success('Option sauvegardée !');
    };

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Paramètres de la page Contact</h2>
            {loading ? (
                <div className="text-gray-400">Chargement…</div>
            ) : (
                <>
                    {/* Texte d'intro/contact */}
                    <form onSubmit={saveIntro} className="mb-8">
                        <label className="block text-lg font-semibold mb-2">Texte d’introduction</label>
                        <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg text-white p-3 mb-2" placeholder="Votre texte de contact…" />
                        <button type="submit" className="px-4 py-2 bg-gold text-black rounded-lg font-semibold">Sauvegarder</button>
                    </form>

                    {/* Option affichage icônes réseaux sociaux sous le Hero */}
                    <div className="mb-8 flex items-center gap-4">
                        <label className="text-lg font-semibold">Afficher les icônes réseaux sociaux sous le Hero</label>
                        <input type="checkbox" checked={showSocialHero} onChange={e => setShowSocialHero(e.target.checked)} onBlur={saveShowSocialHero} className="w-6 h-6" />
                    </div>

                    {/* Bloc gestion des liens de contact (à compléter) */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gold mb-4">Liens de contact</h3>
                        <div className="text-gray-400">Gestion dynamique à venir…</div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ContactSettings; 