-- ============================================================================
-- FitBox Remediation: Storage, Realtime, and Scalable Discovery
-- Migration: 20260925000000_storage_and_realtime_remediation.sql
-- ============================================================================

-- 1. Create dedicated user-media storage bucket for avatars and onboarding photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-media',
  'user-media',
  true,
  10485760, -- 10 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Ensure exercise-media bucket also permits standard image uploads as fallback
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['video/mp4', 'image/svg+xml', 'image/jpeg', 'image/png', 'image/webp']
WHERE id = 'exercise-media';

-- Storage Policies for user-media
DROP POLICY IF EXISTS "Public can view user media" ON storage.objects;
CREATE POLICY "Public can view user media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-media');

DROP POLICY IF EXISTS "Authenticated users can upload own media" ON storage.objects;
CREATE POLICY "Authenticated users can upload own media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-media' AND
  (storage.foldername(name))[1] = 'onboarding' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authenticated users can update own media" ON storage.objects;
CREATE POLICY "Authenticated users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-media' AND
  (storage.foldername(name))[1] = 'onboarding' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Authenticated users can delete own media" ON storage.objects;
CREATE POLICY "Authenticated users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-media' AND
  (storage.foldername(name))[1] = 'onboarding' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- 2. Ensure Realtime UPDATE events for gymbuddy_matches carry full row state (including shared_streak)
ALTER TABLE public.gymbuddy_matches REPLICA IDENTITY FULL;

-- Ensure all GymBuddy tables are included in Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'gymbuddy_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gymbuddy_messages;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'gymbuddy_matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gymbuddy_matches;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'gymbuddy_session_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gymbuddy_session_logs;
  END IF;
END $$;

-- 3. Composite Index on gymbuddy_swipes for scalable candidate exclusion
CREATE INDEX IF NOT EXISTS idx_gymbuddy_swipes_swiper_target 
ON public.gymbuddy_swipes(swiper_id, target_id);

-- 4. Scalable Discovery RPC function using indexed anti-join
CREATE OR REPLACE FUNCTION public.get_gymbuddy_candidates(
  p_limit INT DEFAULT 50
)
RETURNS SETOF public.gymbuddy_profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT gp.*
  FROM public.gymbuddy_profiles gp
  WHERE gp.is_discoverable = true
    AND gp.id != auth.uid()
    AND NOT EXISTS (
      SELECT 1
      FROM public.gymbuddy_swipes gs
      WHERE gs.swiper_id = auth.uid()
        AND gs.target_id = gp.id
    )
  ORDER BY gp.created_at DESC
  LIMIT p_limit;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_gymbuddy_candidates(INT) TO authenticated;
