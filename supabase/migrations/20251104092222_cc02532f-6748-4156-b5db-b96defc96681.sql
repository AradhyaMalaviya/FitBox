-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a new policy that allows anyone to insert profiles
-- This is needed because profile creation happens during signup
CREATE POLICY "Allow profile creation during signup"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Keep the existing policies for select, update, and delete unchanged