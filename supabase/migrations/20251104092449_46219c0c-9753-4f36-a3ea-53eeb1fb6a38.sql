-- Drop all existing RLS policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Since this app uses custom authentication (not Supabase Auth),
-- we need to allow all operations on profiles table
-- Users are managed through local storage, not Supabase Auth

-- Allow anyone to view profiles (needed for username/phone checks during signup)
CREATE POLICY "Allow public read access"
ON public.profiles
FOR SELECT
USING (true);

-- Allow anyone to insert profiles (needed for signup)
CREATE POLICY "Allow public insert"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update profiles (needed for profile updates)
CREATE POLICY "Allow public update"
ON public.profiles
FOR UPDATE
USING (true);

-- Prevent deleting profiles
CREATE POLICY "Prevent profile deletion"
ON public.profiles
FOR DELETE
USING (false);