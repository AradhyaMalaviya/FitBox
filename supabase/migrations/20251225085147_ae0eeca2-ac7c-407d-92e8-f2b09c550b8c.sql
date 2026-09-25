-- Create trainer_sensitive_data table to store PII
CREATE TABLE public.trainer_sensitive_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES public.assigned_trainers(id) ON DELETE CASCADE,
  email text,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(trainer_id)
);

-- Enable RLS with no direct access
ALTER TABLE public.trainer_sensitive_data ENABLE ROW LEVEL SECURITY;

-- Block all direct access - data only accessible via secure function
CREATE POLICY "No direct access to sensitive trainer data"
ON public.trainer_sensitive_data
FOR ALL
TO authenticated
USING (false);

-- Create audit_logs table for tracking access
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (user_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Users cannot modify audit logs (insert only via service role)
CREATE POLICY "No direct insert to audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Migrate existing data from assigned_trainers to trainer_sensitive_data
INSERT INTO public.trainer_sensitive_data (trainer_id, email, phone)
SELECT id, trainer_email, trainer_phone 
FROM public.assigned_trainers
WHERE trainer_email IS NOT NULL OR trainer_phone IS NOT NULL;

-- Remove sensitive columns from assigned_trainers
ALTER TABLE public.assigned_trainers DROP COLUMN IF EXISTS trainer_email;
ALTER TABLE public.assigned_trainers DROP COLUMN IF EXISTS trainer_phone;