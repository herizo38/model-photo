import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Twitter, Facebook, Send, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

const iconMap: Record<string, React.ElementType> = {
    Instagram,
    YouTube: Youtube,
    Twitter,
    Facebook,
    Telegram: Send,
    Uncove: Globe,
    Autre: Globe,
};

interface HeroSocial {
    id: string;
    icon: string;
    name: string;
    url: string;
    desc?: string;
    customIcon?: string; // Added customIcon property
}

const SocialMediaHero: React.FC = () => {
    const [socials, setSocials] = useState<HeroSocial[]>([]);

    useEffect(() => {
        const fetchSocials = async () => {
            try {
                const { data } = await supabase
                    .from('settings')
                    .select('value')
                    .eq('key', 'hero_socials')
                    .maybeSingle();
                let arr = [];
                try {
                    arr = data?.value ? JSON.parse(data.value) : [];
                } catch { arr = []; }
                setSocials(Array.isArray(arr) ? arr : []);
            } catch { }
        };
        fetchSocials();
    }, []);

    return (
        <div className="flex flex-col items-center gap-2 bg-transparent p-0">
            <span className="text-gold font-semibold text-lg mb-1">Follow me</span>
            <div className="flex gap-4">
                {socials.map((social) => {
                    const Icon = iconMap[social.icon] || Globe;
                    return (
                        <motion.a
                            key={social.id}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2 }}
                            className="text-gold hover:text-white transition-colors flex flex-col items-center"
                        >
                            {social.customIcon ? (
                                <img src={social.customIcon} alt={social.name} className="w-8 h-8 object-contain rounded bg-white" />
                            ) : (
                                <Icon className="w-8 h-8" />
                            )}
                            <span className="text-xs mt-1 font-semibold">{social.name}</span>
                            {social.desc && <span className="text-xs text-gray-400 mt-0.5">{social.desc}</span>}
                        </motion.a>
                    );
                })}
            </div>
        </div>
    );
};

export default SocialMediaHero; 