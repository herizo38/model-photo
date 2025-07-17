import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useFontFamily } from '../contexts/LanguageContext';

const citations = [
    // Identité, jeunesse, rêves
    { texte: "Ils ne savaient pas que c'était impossible, alors ils l'ont fait.", auteur: 'Mark Twain', theme: 'identite' },
    { texte: 'Rêve grand, commence petit, agis maintenant.', auteur: 'Robin Sharma', theme: 'identite' },
    { texte: 'Sois toi-même, tous les autres sont déjà pris.', auteur: 'Oscar Wilde', theme: 'identite' },
    { texte: "L’avenir appartient à ceux qui croient à la beauté de leurs rêves.", auteur: 'Eleanor Roosevelt', theme: 'identite' },
    { texte: "Ce que tu fais aujourd’hui peut améliorer tous tes lendemains.", auteur: 'Ralph Marston', theme: 'identite' },

    // Passion, ambition
    { texte: 'La passion est énergie. Ressens le pouvoir que tu obtiens en te concentrant sur ce qui t’enthousiasme.', auteur: 'Oprah Winfrey', theme: 'passion' },
    { texte: 'Fais de ta vie un rêve, et d’un rêve une réalité.', auteur: 'Antoine de Saint-Exupéry', theme: 'passion' },
    { texte: 'Ce n’est pas la taille de la lumière qui compte, mais l’intensité de ce qu’elle éclaire.', auteur: 'Anonyme', theme: 'passion' },
    { texte: "Travaille en silence, laisse ton succès faire du bruit.", auteur: 'Frank Ocean', theme: 'passion' },
    { texte: "L’ambition est le premier pas vers le succès. La seconde, c’est l’action.", auteur: 'Anonyme', theme: 'passion' },

    // Lune, beauté intérieure
    { texte: 'La Lune est témoin de nos silences, de nos espoirs et de nos renaissances.', auteur: 'Anonyme', theme: 'lune' },
    { texte: 'La beauté commence au moment où vous décidez d’être vous-même.', auteur: 'Coco Chanel', theme: 'lune' },
    { texte: 'Même la nuit la plus sombre prendra fin et le soleil se lèvera.', auteur: 'Victor Hugo', theme: 'lune' },
    { texte: "La Lune ne lutte jamais pour briller. Elle attend simplement son heure.", auteur: 'Anonyme', theme: 'lune' },
    { texte: "La Lune est la preuve qu’on peut être entière tout en passant par des phases.", auteur: 'Anonyme', theme: 'lune' },

    // Photographie, sensibilité
    { texte: 'La photographie, c’est une manière de ressentir, de toucher, d’aimer.', auteur: 'Aaron Siskind', theme: 'photo' },
    { texte: 'Ce que la photo reproduit à l’infini n’a lieu qu’une fois.', auteur: 'Roland Barthes', theme: 'photo' },
    { texte: 'Regarde le monde avec les yeux d’un artiste et chaque instant devient lumière.', auteur: 'Anonyme', theme: 'photo' },
    { texte: "Une photographie, c’est un fragment de temps qui ne reviendra pas.", auteur: 'Martine Franck', theme: 'photo' },
    { texte: "La caméra est un instrument qui enseigne aux gens comment voir sans appareil photo.", auteur: 'Dorothea Lange', theme: 'photo' },
];

function getRandomCitation() {
    const idx = Math.floor(Math.random() * citations.length);
    return citations[idx];
}

const GeoBlockedMessage: React.FC = () => {
    const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/toncompte');
    const { fontFamilyTitle } = useFontFamily();
    useEffect(() => {
        const fetchUrl = async () => {
            const { data } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'geoblock_instagram_url')
                .maybeSingle();
            if (data?.value) setInstagramUrl(data.value);
        };
        fetchUrl();
    }, []);
    const citation = getRandomCitation();
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', flexDirection: 'column', padding: 24, textAlign: 'center' }}>
            <h1 className={`font-${fontFamilyTitle}`} style={{ fontSize: '2.2rem', marginBottom: 16 }}>Citation du jour :</h1>
            <blockquote style={{ fontStyle: 'italic', fontSize: '1.3rem', margin: '2rem 0', maxWidth: 600 }}>
                “{citation.texte}”<br />
                <span style={{ display: 'block', marginTop: 12, fontWeight: 500, color: '#d4af37' }}>— {citation.auteur}</span>
            </blockquote>
            {/* <p style={{ marginTop: 32, color: '#aaa' }}>Tu peux me retrouver sur Instagram : <a href={instagramUrl} style={{ color: '#d4af37', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">@Instagram</a></p> */}
        </div>
    );
};

export default GeoBlockedMessage; 