-- ══════════════════════════════════════════════════════════════════════════════
-- Migration: 20261014000000_enable_pgvector_and_semantic_search.sql
-- Description: Enable pgvector extension and configure semantic similarity search
--              tables and RPC functions for exercises and Indian foods.
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Exercise Embeddings table (768 dimensions for Gemini text-embedding-004)
CREATE TABLE IF NOT EXISTS public.exercise_embeddings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast cosine similarity vector retrieval
CREATE INDEX IF NOT EXISTS exercise_embeddings_cosine_idx
  ON public.exercise_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- Enable RLS
ALTER TABLE public.exercise_embeddings ENABLE ROW LEVEL SECURITY;

-- Public read access policy
CREATE POLICY "Public read access for exercise embeddings"
  ON public.exercise_embeddings
  FOR SELECT
  USING (true);

-- 3. Create Food Embeddings table
CREATE TABLE IF NOT EXISTS public.food_embeddings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  dietary TEXT NOT NULL,
  protein NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS food_embeddings_cosine_idx
  ON public.food_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

ALTER TABLE public.food_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for food embeddings"
  ON public.food_embeddings
  FOR SELECT
  USING (true);

-- 4. RPC Vector Match Function for Exercises
CREATE OR REPLACE FUNCTION public.match_exercises(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.60,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  muscle_group TEXT,
  equipment TEXT,
  difficulty TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ee.id,
    ee.name,
    ee.muscle_group,
    ee.equipment,
    ee.difficulty,
    1 - (ee.embedding <=> query_embedding) AS similarity
  FROM public.exercise_embeddings ee
  WHERE 1 - (ee.embedding <=> query_embedding) >= match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 5. RPC Vector Match Function for Foods
CREATE OR REPLACE FUNCTION public.match_foods(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.60,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  category TEXT,
  dietary TEXT,
  protein NUMERIC,
  calories NUMERIC,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fe.id,
    fe.name,
    fe.category,
    fe.dietary,
    fe.protein,
    fe.calories,
    1 - (fe.embedding <=> query_embedding) AS similarity
  FROM public.food_embeddings fe
  WHERE 1 - (fe.embedding <=> query_embedding) >= match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
