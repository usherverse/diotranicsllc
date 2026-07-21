-- IMPORTANT: This script uses the pgcrypto extension to hash the password.
-- Run this in your Supabase SQL Editor.

-- Enable pgcrypto extension if not already enabled (required for crypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- 1. Insert into Supabase Auth Users table
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000', -- default instance id
    'authenticated',
    'authenticated',
    'admin@gmail.com',
    crypt('admin123', gen_salt('bf')), -- bcrypt hash for password
    NOW(), -- Auto-confirm email
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
  );

  -- 2. Insert into your custom admins table
  INSERT INTO public.admins (id, email, role)
  VALUES (
    new_user_id,
    'admin@gmail.com',
    'superadmin'
  );

  RAISE NOTICE 'Admin user created successfully!';
END $$;
