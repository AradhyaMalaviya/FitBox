-- Fix critical security vulnerability in profiles INSERT policy
-- Users should only be able to insert their own profile, not arbitrary user IDs

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());