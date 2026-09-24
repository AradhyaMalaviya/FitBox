-- Migration: 20260921000000_fitbox_remediation.sql
-- Fixes critical database issues for the FitBox project.

-- 1. Fix GymBuddy mutual swipe RLS lock
-- Add a new SELECT policy allowing a user to read swipes where THEY are the target
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'gymbuddy_swipes' 
        AND policyname = 'Users can read right swipes targeted at them'
    ) THEN
        CREATE POLICY "Users can read right swipes targeted at them"
            ON gymbuddy_swipes
            FOR SELECT
            USING (auth.uid() = target_id AND direction = 'right');
    END IF;
END $$;


-- 2. Fix profiles.phone_number NOT NULL UNIQUE crash
-- Alter table to allow nulls, replace the unique constraint with a partial unique index
ALTER TABLE profiles ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN phone_number SET DEFAULT NULL;

-- Drop the existing unique constraint if it exists. 
-- Assuming it might be named something like profiles_phone_number_key or profiles_phone_number_unique.
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass
      AND contype = 'u'
      AND array_to_string(conkey, ',') = (SELECT attnum::text FROM pg_attribute WHERE attrelid = 'profiles'::regclass AND attname = 'phone_number');
      
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Drop the existing unique index if it exists independently of the constraint
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE (c.relname = 'profiles_phone_number_key' OR c.relname = 'profiles_phone_number_unique') AND n.nspname = 'public'
    ) THEN
        DROP INDEX IF EXISTS public.profiles_phone_number_key;
        DROP INDEX IF EXISTS public.profiles_phone_number_unique;
    END IF;
END $$;

-- Update existing empty string phone numbers to NULL
UPDATE profiles SET phone_number = NULL WHERE phone_number = '';

-- Create a PARTIAL unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique ON profiles(phone_number) WHERE phone_number IS NOT NULL AND phone_number != '';


-- 3. Make gymbuddy_messages realtime publication idempotent
DO $$
BEGIN
    -- Check if it's already in the publication
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'gymbuddy_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE gymbuddy_messages;
    END IF;
END $$;


-- 4. Fix gymbuddy_profiles RLS blocking matched partners
-- Add a new SELECT policy allowing matched users to read their partner's profile
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'gymbuddy_profiles' 
        AND policyname = 'Matched users can read partner profiles'
    ) THEN
        CREATE POLICY "Matched users can read partner profiles"
          ON gymbuddy_profiles FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM gymbuddy_matches
              WHERE (
                (gymbuddy_matches.user1_id = auth.uid() AND gymbuddy_matches.user2_id = gymbuddy_profiles.id)
                OR
                (gymbuddy_matches.user2_id = auth.uid() AND gymbuddy_matches.user1_id = gymbuddy_profiles.id)
              )
            )
          );
    END IF;
END $$;


-- 5. Update handle_new_user trigger function to handle NULL phone numbers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_user_id, username, phone_number)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'phone_number', '')
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
