import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider, FontFamilyProvider, useFontFamily, ColorProvider } from './contexts/LanguageContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import useGeoBlock from './hooks/useGeoBlock';
import { Analytics } from '@vercel/analytics/react';
import GeoBlockedMessage from './components/GeoBlockedMessage';

const FontClassApplier: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fontFamilyText, loading } = useFontFamily();
  React.useEffect(() => {
    if (!loading) {
      document.body.classList.remove('font-playfair', 'font-didot', 'font-bodoni', 'font-cormorant');
      document.body.classList.add(`font-${fontFamilyText}`);
    }
  }, [fontFamilyText, loading]);
  return <>{children}</>;
};

function App() {
  const { isBlocked, loadingBlock } = useGeoBlock();
  useEffect(() => {
    const fetchColors = async () => {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['primary_color', 'button_color']);
      const primary = data?.find((row) => row.key === 'primary_color')?.value || '#d4af37';
      const button = data?.find((row) => row.key === 'button_color')?.value || '#d4af37';
      document.documentElement.style.setProperty('--color-primary', primary);
      document.documentElement.style.setProperty('--color-button', button);
    };
    fetchColors();
  }, []);
  if (loadingBlock) return null;
  if (isBlocked) return <GeoBlockedMessage />;
  return (
    <ColorProvider>
      <FontFamilyProvider>
        <FontClassApplier>
          <LanguageProvider>
            <Router>
              <div className="min-h-screen bg-black">
                <Navigation />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin" element={<Admin />} />
                  </Routes>
                </main>
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: '#1f2937',
                      color: '#fff',
                      border: '1px solid #374151',
                    },
                  }}
                />
                <Analytics />
              </div>
            </Router>
          </LanguageProvider>
        </FontClassApplier>
      </FontFamilyProvider>
    </ColorProvider>
  );
}

export default App;