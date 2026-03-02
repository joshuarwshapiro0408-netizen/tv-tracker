-- Run this in the Supabase SQL Editor before using profile edit features.
-- Dashboard → SQL Editor → New query → paste → Run

-- 1. Add favourite_genres column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS favourite_genres text[] DEFAULT '{}';

-- 2. Create public avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for avatars bucket

-- Allow authenticated users to upload/replace their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
    OR name = auth.uid()::text || '.' || RIGHT(name, POSITION('.' IN REVERSE(name)) - 1)
  );

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());

-- Allow public reads
CREATE POLICY "Public can read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
