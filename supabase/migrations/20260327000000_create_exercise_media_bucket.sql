INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exercise-media',
  'exercise-media',
  true,
  52428800,
  ARRAY['video/mp4', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view exercise media" ON storage.objects;

CREATE POLICY "Public can view exercise media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'exercise-media');
