import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function useGeoBlock() {
  useEffect(() => {
    let isMounted = true;
    const checkGeoBlock = async () => {
      // 1. Charger la liste des pays bloqués depuis Supabase
      const { data, error } = await supabase
        .from('geo_block_settings')
        .select('blocked_countries')
        .limit(1)
        .single();
      if (error || !data || !Array.isArray(data.blocked_countries)) return;
      const blockedCountries: string[] = data.blocked_countries;
      // 2. Vérifier le pays de l'utilisateur
      fetch('https://ipapi.co/json/')
        .then(async res => {
          const geo = await res.json();
          if (!isMounted) return;
          if (blockedCountries.includes(geo.country_code)) {
            // 3. Logger le blocage dans Supabase
            await supabase.from('geo_block_logs').insert({
              country_code: geo.country_code,
              ip: geo.ip,
              blocked_at: new Date().toISOString(),
            });
            window.location.href = 'https://www.youtube.com/watch?v=J---aiyznGQ';
          }
        })
        .catch(() => {
          // Optionnel : ne rien faire en cas d'échec
        });
    };
    checkGeoBlock();
    return () => { isMounted = false; };
  }, []);
} 