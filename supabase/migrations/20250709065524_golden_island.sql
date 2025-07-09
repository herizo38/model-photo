/*
  # Professional Photo Model Portfolio Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, category name)
      - `name_fr` (text, French translation)
      - `name_en` (text, English translation)
      - `description` (text, optional description)
      - `color` (text, hex color for UI)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `photos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, photo title)
      - `description` (text, optional description)
      - `image_url` (text, photo URL)
      - `thumbnail_url` (text, optional thumbnail)
      - `category_id` (uuid, foreign key to categories)
      - `tags` (text array, searchable tags)
      - `featured` (boolean, for homepage display)
      - `views` (integer, view count)
      - `clicks` (integer, click count)
      - `shares` (integer, share count)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `contact_messages`
      - `id` (uuid, primary key)
      - `name` (text, sender name)
      - `email` (text, sender email)
      - `subject` (text, message subject)
      - `message` (text, message content)
      - `status` (text, read status)
      - `ip_address` (text, sender IP)
      - `user_agent` (text, browser info)
      - `created_at` (timestamp)

    - `blocked_ips`
      - `id` (uuid, primary key)
      - `ip_address` (text, blocked IP)
      - `reason` (text, block reason)
      - `blocked_by` (uuid, admin user)
      - `created_at` (timestamp)

    - `social_links`
      - `id` (uuid, primary key)
      - `platform` (text, social platform name)
      - `url` (text, profile URL)
      - `icon` (text, icon name)
      - `active` (boolean, display status)
      - `order_index` (integer, display order)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and public access
    - Secure admin-only operations

  3. Indexes
    - Performance indexes for common queries
    - Full-text search capabilities
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_fr text NOT NULL,
  name_en text NOT NULL,
  description text,
  color text DEFAULT '#d4af37',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  thumbnail_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  shares integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create blocked_ips table
CREATE TABLE IF NOT EXISTS blocked_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  reason text,
  blocked_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create social_links table
CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL,
  active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Categories are manageable by authenticated users"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Photos policies
CREATE POLICY "Photos are viewable by everyone"
  ON photos FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Photos are manageable by authenticated users"
  ON photos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Contact messages policies
CREATE POLICY "Contact messages are insertable by everyone"
  ON contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Contact messages are viewable by authenticated users"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Contact messages are manageable by authenticated users"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (true);

-- Blocked IPs policies
CREATE POLICY "Blocked IPs are viewable by authenticated users"
  ON blocked_ips FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Blocked IPs are manageable by authenticated users"
  ON blocked_ips FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Social links policies
CREATE POLICY "Social links are viewable by everyone"
  ON social_links FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Social links are manageable by authenticated users"
  ON social_links FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category_id);
CREATE INDEX IF NOT EXISTS idx_photos_featured ON photos(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_photos_created ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_tags ON photos USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_links_active ON social_links(active, order_index) WHERE active = true;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, name_fr, name_en, description, color) VALUES
  ('Fashion', 'Mode', 'Fashion', 'Fashion photography and editorial shoots', '#e91e63'),
  ('Portraits', 'Portraits', 'Portraits', 'Professional portrait photography', '#9c27b0'),
  ('Editorial', 'Éditorial', 'Editorial', 'Magazine and editorial photography', '#3f51b5'),
  ('Commercial', 'Commercial', 'Commercial', 'Brand campaigns and commercial work', '#00bcd4'),
  ('Beauty', 'Beauté', 'Beauty', 'Beauty and cosmetic photography', '#ff9800')
ON CONFLICT DO NOTHING;

-- Insert default social links
INSERT INTO social_links (platform, url, icon, active, order_index) VALUES
  ('Instagram', 'https://instagram.com', 'Instagram', true, 1),
  ('TikTok', 'https://tiktok.com', 'Music', true, 2),
  ('Facebook', 'https://facebook.com', 'Facebook', true, 3),
  ('YouTube', 'https://youtube.com', 'Youtube', true, 4)
ON CONFLICT DO NOTHING;