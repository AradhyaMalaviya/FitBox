-- Step 1: Add user_id column that will link to auth.users
-- First, make id nullable temporarily to allow migration
ALTER TABLE public.profiles ALTER COLUMN id DROP DEFAULT;

-- Add auth_user_id column to link to Supabase Auth
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);

-- Step 2: Drop all existing insecure RLS policies
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update" ON public.profiles;
DROP POLICY IF EXISTS "Prevent profile deletion" ON public.profiles;

-- Step 3: Create secure RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id);

CREATE POLICY "Profiles cannot be deleted"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);

-- Step 4: Fix workouts RLS policies to use proper auth
DROP POLICY IF EXISTS "Users can view their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can insert their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON public.workouts;

CREATE POLICY "Users can view their own workouts"
ON public.workouts
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own workouts"
ON public.workouts
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own workouts"
ON public.workouts
FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own workouts"
ON public.workouts
FOR DELETE
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

-- Step 5: Fix payment_transactions RLS policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Payment transactions are immutable" ON public.payment_transactions;
DROP POLICY IF EXISTS "Payment transactions cannot be deleted" ON public.payment_transactions;

CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own transactions"
ON public.payment_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Payment transactions are immutable"
ON public.payment_transactions
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Payment transactions cannot be deleted"
ON public.payment_transactions
FOR DELETE
TO authenticated
USING (false);

-- Step 6: Fix subscriptions RLS policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users cannot update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users cannot delete subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users cannot update subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Users cannot delete subscriptions"
ON public.subscriptions
FOR DELETE
TO authenticated
USING (false);

-- Step 7: Fix assigned_trainers RLS policies
DROP POLICY IF EXISTS "Users can view their assigned trainer" ON public.assigned_trainers;
DROP POLICY IF EXISTS "Users cannot assign trainers" ON public.assigned_trainers;
DROP POLICY IF EXISTS "Users cannot modify trainer assignments" ON public.assigned_trainers;
DROP POLICY IF EXISTS "Users cannot delete trainer assignments" ON public.assigned_trainers;

CREATE POLICY "Users can view their assigned trainer"
ON public.assigned_trainers
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users cannot assign trainers"
ON public.assigned_trainers
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Users cannot modify trainer assignments"
ON public.assigned_trainers
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Users cannot delete trainer assignments"
ON public.assigned_trainers
FOR DELETE
TO authenticated
USING (false);

-- Step 8: Create trigger to automatically create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, auth_user_id, username, phone_number)
  VALUES (gen_random_uuid(), NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', ''), COALESCE(NEW.raw_user_meta_data->>'phone_number', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();