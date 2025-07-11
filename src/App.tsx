import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './contexts/LanguageContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import useGeoBlock from './hooks/useGeoBlock';

function App() {
  useGeoBlock();
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
  return (
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
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;