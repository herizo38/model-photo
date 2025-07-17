import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const citations = [
    // Identité douce, solitude assumée
    { texte: "Sois douce avec toi-même, tu es en train de te construire.", auteur: 'Anonyme', theme: 'identite' },
    { texte: "Rester soi-même dans un monde qui tente constamment de te changer est le plus grand des accomplissements.", auteur: 'Ralph Waldo Emerson', theme: 'identite' },
    { texte: "Il y a de la force dans la douceur et du courage dans la solitude choisie.", auteur: 'Anonyme', theme: 'identite' },

    // Lenteur, ville, introspection
    { texte: "Marcher lentement, c’est parfois avancer plus profondément.", auteur: 'Anonyme', theme: 'lenteur' },
    { texte: "La ville est un poème à lire avec les écouteurs aux oreilles.", auteur: 'Anonyme', theme: 'ville' },
    { texte: "Chaque coin de rue a une chanson à murmurer à celles qui savent écouter.", auteur: 'Anonyme', theme: 'ville' },

    // Silence, thé, rituels calmes
    { texte: "Le silence est un espace sacré où l’âme se ressource.", auteur: 'Anonyme', theme: 'silence' },
    { texte: "Une tasse de thé partagée avec soi-même est un acte de paix intérieure.", auteur: 'Anonyme', theme: 'rituel' },
    { texte: "Il n’y a pas de moment ordinaire lorsqu’on le savoure en pleine présence.", auteur: 'Anonyme', theme: 'rituel' },

    // Création, inspiration
    { texte: "Créer, c’est traduire le monde intérieur en lumière.", auteur: 'Anonyme', theme: 'creation' },
    { texte: "La créativité naît dans les moments d’écoute silencieuse.", auteur: 'Anonyme', theme: 'creation' },
    { texte: "Les idées naissent souvent dans les interstices entre deux respirations.", auteur: 'Anonyme', theme: 'creation' },

    // Yoga, équilibre, respiration
    { texte: "Le corps s'exprime là où les mots ne suffisent plus.", auteur: 'Anonyme', theme: 'yoga' },
    { texte: "Inspire calme, expire clarté.", auteur: 'Anonyme', theme: 'yoga' },
    { texte: "La lenteur du mouvement révèle la profondeur de l’instant.", auteur: 'Anonyme', theme: 'yoga' }
];


function getRandomCitation() {
    const idx = Math.floor(Math.random() * citations.length);
    return citations[idx];
}

const GeoBlockedMessage: React.FC = () => {
    const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/toncompte');
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
            <h1 style={{ fontSize: '2.2rem', marginBottom: 16 }}>🌙 Accès restreint</h1>
            <blockquote style={{ fontStyle: 'italic', fontSize: '1.3rem', margin: '2rem 0', maxWidth: 600 }}>
                “{citation.texte}”<br />
                <span style={{ display: 'block', marginTop: 12, fontWeight: 500, color: '#d4af37' }}>— {citation.auteur}</span>
            </blockquote>
            <p style={{ marginTop: 32, color: '#aaa' }}>Tu peux me retrouver sur Instagram : <a href={instagramUrl} style={{ color: '#d4af37', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">@Instagram</a></p>
        </div>
    );
};

export default GeoBlockedMessage; 