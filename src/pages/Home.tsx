import React from 'react';
import Hero from '../components/Hero';
import PresentationSection from '../components/PresentationSection';
import FeaturedPhotos from '../components/FeaturedPhotos';
import SocialMedia from '../components/SocialMedia';
import ContactForm from '../components/ContactForm';

const Home: React.FC = () => {
  return (
    <div>
      <Hero />
      <PresentationSection />
      <FeaturedPhotos />
      <SocialMedia />
      <ContactForm />
    </div>
  );
};

export default Home;