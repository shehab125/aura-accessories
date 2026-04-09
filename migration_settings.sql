-- Create settings table for site-wide configuration
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial main row if missing
INSERT INTO settings (id, data)
VALUES ('main', '{
    "siteName": "Aura Accessories",
    "auraFamily": [
        {"name": "شهاب حسني", "image": ""},
        {"name": "محمود مصطفى", "image": ""}
    ]
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Grant public read access to the settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Settings" ON settings FOR SELECT USING (true);
