-- ============================================================================
-- Fix Infinite Recursion in gymbuddy_profiles RLS policy
-- Migration: 20260925120000_fix_gymbuddy_profiles_recursion.sql
-- ============================================================================

-- Create a SECURITY DEFINER function to check if the caller is discoverable without re-triggering RLS
CREATE OR REPLACE FUNCTION public.is_user_discoverable(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_discoverable FROM public.gymbuddy_profiles WHERE id = user_id),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_user_discoverable(uuid) TO authenticated, anon;

-- Replace the recursive policy on gymbuddy_profiles
DROP POLICY IF EXISTS "Discoverable users can read public profiles" ON public.gymbuddy_profiles;

CREATE POLICY "Discoverable users can read public profiles"
  ON public.gymbuddy_profiles FOR SELECT
  USING (
    profile_visibility = 'public' 
    AND auth.uid() IS NOT NULL
    AND public.is_user_discoverable(auth.uid())
  );
