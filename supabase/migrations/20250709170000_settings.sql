-- Table settings pour paramètres globaux (about, contact, bio, etc.)
CREATE TABLE IF NOT EXISTS settings (
    key text PRIMARY KEY,
    value text,
    updated_at timestamptz DEFAULT now()
);
-- Sécurité
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are viewable by everyone" ON settings FOR
SELECT TO public USING (true);
CREATE POLICY "Settings are manageable by authenticated users" ON settings FOR ALL TO authenticated USING (true) WITH CHECK (true);