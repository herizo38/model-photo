import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PIXABAY_API_KEY = '51361304-cc5036b2aeece1e0da9875b42';

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

const themeToPixabayQuery: Record<string, string> = {
    identite: 'inspiration',
    lenteur: 'slow life',
    ville: 'city walk',
    silence: 'silence',
    rituel: 'tea',
    creation: 'creativity',
    yoga: 'gentle yoga',
};

function getRandomCitation() {
    const idx = Math.floor(Math.random() * citations.length);
    return citations[idx];
}

const GeoBlockedMessage: React.FC = () => {
    const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/toncompte');
    const [siteTitle, setSiteTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageLoaded, setImageLoaded] = useState(false);
    const citation = getRandomCitation();

    useEffect(() => {
        const fetchUrl = async () => {
            const { data } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'geoblock_instagram_url')
                .maybeSingle();
            if (data?.value) setInstagramUrl(data.value);
        };
        const fetchSiteTitle = async () => {
            const { data } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'site_title')
                .maybeSingle();
            if (data?.value) setSiteTitle(data.value);
        };
        fetchUrl();
        fetchSiteTitle();
    }, []);

    useEffect(() => {
        // Recherche d'une image sur Pixabay selon le thème de la citation
        const fetchImage = async () => {
            const theme = citation.theme;
            const query = themeToPixabayQuery[theme] || 'inspiration';
            try {
                const res = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=20&safesearch=true`);
                const data = await res.json();
                if (data.hits && data.hits.length > 0) {
                    const randomIdx = Math.floor(Math.random() * data.hits.length);
                    setImageUrl(data.hits[randomIdx].webformatURL);
                }
            } catch {
                setImageUrl('');
            }
        };
        fetchImage();
    }, [citation]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#fff', flexDirection: 'column', padding: 24, textAlign: 'center' }}>
            {/* <h1 style={{ fontSize: '2.2rem', marginBottom: 16 }}>🌙 Accès restreint</h1> */}
            <blockquote style={{ fontStyle: 'italic', fontSize: '1.3rem', margin: '2rem 0', maxWidth: 600 }}>
                “{citation.texte}”<br />
                <span style={{ display: 'block', marginTop: 12, fontWeight: 500, color: '#d4af37' }}>— {citation.auteur}</span>
            </blockquote>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={citation.theme}
                    style={{
                        width: '100%',
                        maxWidth: 420,
                        borderRadius: 18,
                        margin: '1.5rem auto',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                        opacity: imageLoaded ? 1 : 0,
                        transform: imageLoaded ? 'scale(1)' : 'scale(1.05)',
                        transition: 'opacity 1s, transform 1s',
                        display: 'block',
                    }}
                    onLoad={() => setImageLoaded(true)}
                />
            )}
            {/* <p style={{ marginTop: 32, color: '#aaa' }}>Tu peux me retrouver sur Instagram : <a href={instagramUrl} style={{ color: '#d4af37', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">@Instagram</a></p> */}
            <footer style={{
                marginTop: 40,
                borderTop: '1px solid rgba(255,255,255,0.10)',
                paddingTop: 20,
                color: '#e0e0e0',
                fontSize: '1rem',
                opacity: 0.85
            }}>
                <div style={{ marginBottom: 6 }}>
                    Ici je partage chaque jour une inspiration motivante.
                </div>
                <div style={{ fontWeight: 600, color: '#d4af37', fontSize: '1.08rem', letterSpacing: '0.01em' }}>
                    {siteTitle && `${siteTitle}`}
                </div>
            </footer>
        </div>
    );
};

export default GeoBlockedMessage; 