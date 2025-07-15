/*
  # Hero Slides Table

  1. New Tables
    - `hero_slides`
      - `id` (uuid, primary key)
      - `image_url` (text, slide image URL)
      - `video_url` (text, optional video URL)
      - `title` (text, slide title)
      - `subtitle` (text, slide subtitle)
      - `position` (integer, display order)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on hero_slides table
    - Add policies for public read access and authenticated write access

  3. Indexes
    - Index on position for ordering
*/

-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  video_url text,
  title text NOT NULL,
  subtitle text NOT NULL,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Hero slides policies
CREATE POLICY "Hero slides are viewable by everyone"
  ON hero_slides FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Hero slides are manageable by authenticated users"
  ON hero_slides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_hero_slides_position ON hero_slides(position);

-- Add updated_at trigger
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();