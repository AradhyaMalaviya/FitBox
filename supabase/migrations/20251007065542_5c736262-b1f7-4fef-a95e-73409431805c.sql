-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = id);

-- Create workouts table for storing workout history
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  muscle_group TEXT,
  sets INTEGER,
  reps INTEGER,
  duration TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for workouts
CREATE POLICY "Users can view their own workouts" 
ON public.workouts 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles));

CREATE POLICY "Users can insert their own workouts" 
ON public.workouts 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles));

CREATE POLICY "Users can update their own workouts" 
ON public.workouts 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.profiles));

CREATE POLICY "Users can delete their own workouts" 
ON public.workouts 
FOR DELETE 
USING (user_id IN (SELECT id FROM public.profiles));

-- Create index for faster lookups
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_phone ON public.profiles(phone_number);