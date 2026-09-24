import { supabaseUrl } from "@/lib/env";

export const EXERCISE_MEDIA_BUCKET = "exercise-media";

/**
 * Builds the canonical public URL for exercise media (videos and posters)
 * hosted in the Supabase Storage bucket created by migration 20260320000100
 * and populated by scripts/upload-exercise-media.mjs.
 */
export const buildExerciseMediaUrl = (directory: "videos" | "posters", filename: string): string => {
  if (!filename) return "";
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  const cleanFilename = filename.replace(/^\/+/, "");
  return `${supabaseUrl}/storage/v1/object/public/${EXERCISE_MEDIA_BUCKET}/${directory}/${cleanFilename}`;
};
