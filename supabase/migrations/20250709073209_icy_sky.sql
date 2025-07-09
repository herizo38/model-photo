/*
  # Add function to increment photo views

  1. Functions
    - `increment_photo_views` - Safely increment view count for a photo
    - `increment_photo_clicks` - Safely increment click count for a photo
    - `increment_photo_shares` - Safely increment share count for a photo

  2. Security
    - Functions are accessible to all users (public)
    - Safe atomic operations to prevent race conditions
*/

-- Function to increment photo views
CREATE OR REPLACE FUNCTION increment_photo_views(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE photos 
  SET views = COALESCE(views, 0) + 1,
      updated_at = now()
  WHERE id = photo_id;
END;
$$;

-- Function to increment photo clicks
CREATE OR REPLACE FUNCTION increment_photo_clicks(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE photos 
  SET clicks = COALESCE(clicks, 0) + 1,
      updated_at = now()
  WHERE id = photo_id;
END;
$$;

-- Function to increment photo shares
CREATE OR REPLACE FUNCTION increment_photo_shares(photo_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE photos 
  SET shares = COALESCE(shares, 0) + 1,
      updated_at = now()
  WHERE id = photo_id;
END;
$$;

-- Grant execute permissions to all users
GRANT EXECUTE ON FUNCTION increment_photo_views(uuid) TO public;
GRANT EXECUTE ON FUNCTION increment_photo_clicks(uuid) TO public;
GRANT EXECUTE ON FUNCTION increment_photo_shares(uuid) TO public;