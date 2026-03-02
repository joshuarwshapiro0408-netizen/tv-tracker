-- trakr migration — safe to run multiple times
-- Dashboard → SQL Editor → New query → paste → Run

-- ──────────────────────────────────────────────
-- 1. Add columns to profiles (safe — IF NOT EXISTS)
-- ──────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS favourite_genres text[] DEFAULT '{}';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name text;

-- ──────────────────────────────────────────────
-- 2. Create avatars storage bucket (safe — ON CONFLICT DO NOTHING)
-- ──────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────
-- 3. Storage policies — created only if they don't exist yet
-- ──────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'Users can upload own avatar'
  ) THEN
    CREATE POLICY "Users can upload own avatar"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND (
          (storage.foldername(name))[1] = auth.uid()::text
          OR name = auth.uid()::text || '.' || RIGHT(name, POSITION('.' IN REVERSE(name)) - 1)
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'Users can update own avatar'
  ) THEN
    CREATE POLICY "Users can update own avatar"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'avatars' AND owner = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'Public can read avatars'
  ) THEN
    CREATE POLICY "Public can read avatars"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'avatars');
  END IF;
END;
$$;

-- ──────────────────────────────────────────────
-- 4. Profile auto-creation trigger
-- Creates a profiles row when a new user signs up
-- ──────────────────────────────────────────────

-- Step 1: create or replace the function (always safe)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username'
  )
  ON CONFLICT (id) DO UPDATE
    SET username = COALESCE(excluded.username, profiles.username);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: create the trigger only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END;
$$;
