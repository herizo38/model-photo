/*
  # Storage Buckets Configuration

  1. Storage Buckets
    - `media` - For photos and videos
    - `public` - For logos and public assets
    - `social-icons` - For social media icons

  2. Security
    - Public read access for all buckets
    - Authenticated write access for all buckets

  3. Policies
    - Allow public to view all objects
    - Allow authenticated users to upload/manage objects
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('media', 'media', true),
  ('public', 'public', true),
  ('social-icons', 'social-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Media bucket policies
CREATE POLICY "Media files are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated users can update media files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can delete media files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

-- Public bucket policies
CREATE POLICY "Public files are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload public files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'public');

CREATE POLICY "Authenticated users can update public files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can delete public files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'public');

-- Social icons bucket policies
CREATE POLICY "Social icon files are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'social-icons');

CREATE POLICY "Authenticated users can upload social icon files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'social-icons');

CREATE POLICY "Authenticated users can update social icon files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'social-icons');

CREATE POLICY "Authenticated users can delete social icon files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'social-icons');