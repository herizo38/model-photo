import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

const NAV_KEYS = [
    { key: 'show_nav_home', label: 'Accueil' },
    { key: 'show_nav_gallery', label: 'Galerie' },
    { key: 'show_nav_about', label: 'À propos' },
    { key: 'show_nav_contact', label: 'Contact' },
    { key: 'show_nav_admin', label: 'Admin' },
];

const NavigationSettings: React.FC = () => {
    const [navVisibility, setNavVisibility] = useState({
        show_nav_home: true,
        show_nav_gallery: true,
        show_nav_about: true,
        show_nav_contact: true,
        show_nav_admin: true,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNavSettings = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('settings')
                .select('key, value')
                .in('key', NAV_KEYS.map(k => k.key));
            setNavVisibility({
                show_nav_home: data?.find(row => row.key === 'show_nav_home')?.value !== 'false',
                show_nav_gallery: data?.find(row => row.key === 'show_nav_gallery')?.value !== 'false',
                show_nav_about: data?.find(row => row.key === 'show_nav_about')?.value !== 'false',
                show_nav_contact: data?.find(row => row.key === 'show_nav_contact')?.value !== 'false',
                show_nav_admin: data?.find(row => row.key === 'show_nav_admin')?.value !== 'false',
            });
            setLoading(false);
        };
        fetchNavSettings();
    }, []);

    const handleToggle = async (key: string) => {
        const newValue = !navVisibility[key as keyof typeof navVisibility];
        setNavVisibility(v => ({ ...v, [key]: newValue }));
        await supabase
            .from('settings')
            .upsert({ key, value: newValue ? 'true' : 'false' });
        toast.success('Option sauvegardée !');
    };

    if (loading) return <div className="text-white">Chargement...</div>;

    return (
        <div className="bg-black min-h-screen p-6 text-white">
            <div className="max-w-lg mx-auto">
                <h1 className="text-2xl font-bold mb-8">Navigation - Affichage des liens</h1>
                <div className="space-y-6">
                    {NAV_KEYS.map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={navVisibility[key as keyof typeof navVisibility]}
                                onChange={() => handleToggle(key)}
                            />
                            <span className="text-white">Afficher « {label} »</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NavigationSettings; 