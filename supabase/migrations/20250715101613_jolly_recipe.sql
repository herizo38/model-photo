/*
  # Default Settings Data

  1. Initial Settings
    - Insert default configuration values for the application
    - Hero section settings
    - Featured photos settings
    - Social media settings
    - Contact settings
    - Navigation settings

  2. Data Structure
    - All settings stored as key-value pairs in settings table
    - JSON values for complex data structures
*/

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  -- Hero section
  ('hero_title', 'Eva Moon'),
  ('hero_subtitle', 'Professional Model & Artist'),
  ('hero_show_socials', 'true'),
  
  -- Featured photos section
  ('featured_title', 'Featured Photos'),
  ('featured_title_color', '#ffffff'),
  ('featured_title_size', '3rem'),
  ('featured_desc', 'Discover my latest work and creative projects'),
  
  -- Gallery settings
  ('gallery_title', 'Gallery'),
  ('gallery_title_color', '#ffffff'),
  ('gallery_title_size', '4rem'),
  ('gallery_desc', 'Explore my complete portfolio'),
  ('gallery_desc_color', '#d1d5db'),
  ('gallery_desc_size', '1.25rem'),
  ('gallery_photos_per_page', '12'),
  ('gallery_default_view', 'grid'),
  ('gallery_show_filters', 'true'),
  ('gallery_show_search', 'true'),
  
  -- Social media
  ('social_title', 'Follow My Journey'),
  ('social_desc', 'Stay updated with my latest work and behind-the-scenes content'),
  ('telegram_url', ''),
  ('tiktok_url', ''),
  ('hero_socials', '[]'),
  
  -- Contact settings
  ('contact_title', 'Get In Touch'),
  ('contact_intro', 'Ready to create something extraordinary together?'),
  ('contact_phone', '+1 (555) 123-4567'),
  ('contact_email', 'hello@modelportfolio.com'),
  ('contact_address', 'New York, NY'),
  ('contact_links', '[]'),
  ('show_contact_form', 'true'),
  ('show_social_hero', 'true'),
  ('contact_form_fields', '[]'),
  
  -- About page
  ('about_text', 'Welcome to my professional portfolio.'),
  ('about_journey', 'Tell your story here.'),
  ('about_achievements', '[]'),
  ('about_specialties', '[]'),
  ('about_stats', '[]'),
  ('about_cta_title', 'Ready to Work Together?'),
  ('about_cta_desc', 'Let''s create something extraordinary together.'),
  ('about_cta_btn', 'Get In Touch'),
  ('about_cta_btn_link', '/contact'),
  ('about_cta_btn_color', '#d4af37'),
  ('about_cta_title_size', '2rem'),
  
  -- Site settings
  ('site_title', 'Eva Moon'),
  ('site_description', 'Professional model portfolio featuring fashion, portrait, and commercial photography.'),
  ('site_logo', ''),
  ('primary_color', '#d4af37'),
  ('button_color', '#d4af37'),
  
  -- Navigation settings
  ('show_nav_home', 'true'),
  ('show_nav_gallery', 'true'),
  ('show_nav_about', 'true'),
  ('show_nav_contact', 'true'),
  ('show_nav_admin', 'true'),
  
  -- Presentation section
  ('presentation_title', ''),
  ('presentation_title_color', '#ffffff'),
  ('presentation_title_size', '3rem'),
  ('presentation_subtitle', ''),
  ('presentation_subtitle_color', '#d1d5db'),
  ('presentation_subtitle_size', '1.25rem'),
  ('presentation_description', ''),
  ('presentation_description_color', '#9ca3af'),
  ('presentation_description_size', '1rem'),
  ('presentation_button_text', ''),
  ('presentation_button_link', ''),
  ('presentation_button_color', '#d4af37'),
  ('presentation_button_text_color', '#000000'),
  ('presentation_show_button', 'true'),
  ('presentation_background_image', ''),
  ('presentation_background_color', '#111827'),
  ('presentation_overlay_opacity', '0.5'),
  ('presentation_text_align', 'center'),
  ('presentation_max_width', '4xl'),
  ('presentation_padding', '20'),
  ('presentation_visible', 'false')

ON CONFLICT (key) DO NOTHING;