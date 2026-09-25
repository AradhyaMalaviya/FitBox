-- Fix all security issues

-- 1. Prevent users from modifying or deleting payment transactions (immutable after creation)
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

-- 2. Prevent users from modifying or deleting subscriptions
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

-- 3. Prevent users from creating, modifying, or deleting trainer assignments
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

-- 4. Prevent users from deleting their profiles
CREATE POLICY "Users cannot delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);

-- 5. Fix function search_path issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;