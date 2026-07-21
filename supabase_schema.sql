-- SQL Schema for Diotranics Supabase Integration

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('electrical', 'solar', 'borehole')),
  location TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Project Images Table
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_hero BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sections Table (for dynamic homepage control)
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Admins Table (for role verification)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'editor'
);

-- Enable RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policies: Anonymous read, Admin CRUD
-- (Note: You may need to refine these depending on your security needs)

-- Public Access
CREATE POLICY "Public Read Projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public Read Images" ON images FOR SELECT USING (true);
CREATE POLICY "Public Read Sections" ON sections FOR SELECT USING (true);

-- Admin Access (Requires being in the admins table)
CREATE POLICY "Admin CRUD Projects" ON projects 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admin CRUD Images" ON images 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

CREATE POLICY "Admin CRUD Sections" ON sections 
  USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid()));

/* ────────────────────────── Storage ─────────────────────────────── */

-- 1. Ensure the 'project-media' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public read access to all files in 'project-media'
CREATE POLICY "Allow Public View"
ON storage.objects FOR SELECT
USING ( bucket_id = 'project-media' );

-- 3. Allow authenticated users (Admins) to upload files
CREATE POLICY "Allow Admin Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'project-media' );

-- 4. Allow authenticated users (Admins) to update/overwrite files
CREATE POLICY "Allow Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'project-media' );

-- 5. Allow authenticated users (Admins) to delete files
CREATE POLICY "Allow Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'project-media' );

