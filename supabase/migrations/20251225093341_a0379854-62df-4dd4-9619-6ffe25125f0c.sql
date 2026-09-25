-- Create workout_sessions table
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_logs table (links exercises to sessions)
CREATE TABLE public.workout_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  exercise_id TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout_sets table (actual set data)
CREATE TABLE public.workout_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_id UUID NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight REAL NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

-- RLS policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions"
ON public.workout_sessions FOR SELECT
USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own workout sessions"
ON public.workout_sessions FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own workout sessions"
ON public.workout_sessions FOR UPDATE
USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own workout sessions"
ON public.workout_sessions FOR DELETE
USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- RLS policies for workout_logs (access via session ownership)
CREATE POLICY "Users can view their own workout logs"
ON public.workout_logs FOR SELECT
USING (session_id IN (
  SELECT id FROM workout_sessions 
  WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
));

CREATE POLICY "Users can insert their own workout logs"
ON public.workout_logs FOR INSERT
WITH CHECK (session_id IN (
  SELECT id FROM workout_sessions 
  WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
));

CREATE POLICY "Users can update their own workout logs"
ON public.workout_logs FOR UPDATE
USING (session_id IN (
  SELECT id FROM workout_sessions 
  WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
));

CREATE POLICY "Users can delete their own workout logs"
ON public.workout_logs FOR DELETE
USING (session_id IN (
  SELECT id FROM workout_sessions 
  WHERE user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
));

-- RLS policies for workout_sets (access via log -> session ownership)
CREATE POLICY "Users can view their own workout sets"
ON public.workout_sets FOR SELECT
USING (log_id IN (
  SELECT wl.id FROM workout_logs wl
  JOIN workout_sessions ws ON wl.session_id = ws.id
  WHERE ws.user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
));

CREATE POLICY "Users can insert their own workout sets"
ON public.workout_sets FOR INSERT
WITH CHECK (log_id IN (
  SELECT wl.id FROM workout_logs wl
  JOIN workout_sessions ws ON wl.session_id = ws.id
  WHERE ws.user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
));

CREATE POLICY "Users can update their own workout sets"
ON public.workout_sets FOR UPDATE
USING (log_id IN (
  SELECT wl.id FROM workout_logs wl
  JOIN workout_sessions ws ON wl.session_id = ws.id
  WHERE ws.user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
));

CREATE POLICY "Users can delete their own workout sets"
ON public.workout_sets FOR DELETE
USING (log_id IN (
  SELECT wl.id FROM workout_logs wl
  JOIN workout_sessions ws ON wl.session_id = ws.id
  WHERE ws.user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
));

-- Create indexes for better query performance
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_status ON public.workout_sessions(status);
CREATE INDEX idx_workout_logs_session_id ON public.workout_logs(session_id);
CREATE INDEX idx_workout_sets_log_id ON public.workout_sets(log_id);