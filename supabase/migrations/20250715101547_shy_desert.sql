/*
  # URL Clicks Tracking Table

  1. New Tables
    - `url_clicks`
      - `id` (uuid, primary key)
      - `ip` (text, visitor IP address)
      - `device` (text, device type)
      - `location_country` (text, visitor country)
      - `location_city` (text, visitor city)
      - `clicked_at` (timestamp)

  2. Security
    - Enable RLS on url_clicks table
    - Add policies for public insert and authenticated read access

  3. Indexes
    - Index on clicked_at for analytics
    - Index on location_country for geo analytics
*/

-- Create url_clicks table
CREATE TABLE IF NOT EXISTS url_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text,
  device text,
  location_country text,
  location_city text,
  clicked_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE url_clicks ENABLE ROW LEVEL SECURITY;

-- URL clicks policies
CREATE POLICY "URL clicks are insertable by everyone"
  ON url_clicks FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "URL clicks are viewable by authenticated users"
  ON url_clicks FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_url_clicks_clicked_at ON url_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_url_clicks_country ON url_clicks(location_country);
CREATE INDEX IF NOT EXISTS idx_url_clicks_ip ON url_clicks(ip);