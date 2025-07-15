/*
  # Add Video Support to Photos Table

  1. Table Modifications
    - Add `video_url` column to photos table for video content

  2. Updates
    - Allow photos to have optional video content alongside images
*/

-- Add video_url column to photos table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE photos ADD COLUMN video_url text;
  END IF;
END $$;