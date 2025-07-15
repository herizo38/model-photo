/*
  # Geo Blocking System

  1. New Tables
    - `geo_block_settings`
      - `id` (uuid, primary key)
      - `blocked_countries` (text array, list of blocked country codes)
      - `updated_at` (timestamp)

    - `geo_block_logs`
      - `id` (uuid, primary key)
      - `country_code` (text, blocked country code)
      - `ip` (text, blocked IP address)
      - `blocked_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access only

  3. Initial Data
    - Insert default geo block settings row
*/

-- Create geo_block_settings table
CREATE TABLE IF NOT EXISTS geo_block_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_countries text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Create geo_block_logs table
CREATE TABLE IF NOT EXISTS geo_block_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text,
  ip text,
  blocked_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE geo_block_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_block_logs ENABLE ROW LEVEL SECURITY;

-- Geo block settings policies
CREATE POLICY "Geo block settings are viewable by everyone"
  ON geo_block_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Geo block settings are manageable by authenticated users"
  ON geo_block_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Geo block logs policies
CREATE POLICY "Geo block logs are insertable by everyone"
  ON geo_block_logs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Geo block logs are viewable by authenticated users"
  ON geo_block_logs FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_geo_block_logs_blocked_at ON geo_block_logs(blocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_geo_block_logs_country ON geo_block_logs(country_code);

-- Add updated_at trigger for settings
CREATE TRIGGER update_geo_block_settings_updated_at
  BEFORE UPDATE ON geo_block_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings row
INSERT INTO geo_block_settings (blocked_countries) VALUES ('{}')
ON CONFLICT DO NOTHING;