-- Create subscription and payment tables

-- Subscription plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_inr integer NOT NULL,
  duration_days integer NOT NULL DEFAULT 30,
  features jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true
);

-- User subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'pending', -- pending, active, expired, cancelled
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  auto_renewal boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Payment transactions table
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id),
  user_id uuid NOT NULL,
  order_id text NOT NULL,
  transaction_id text,
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending', -- pending, success, failed
  amount_inr integer NOT NULL,
  currency text DEFAULT 'INR',
  payment_timestamp timestamp with time zone,
  razorpay_payment_id text,
  razorpay_order_id text,
  razorpay_signature text,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Assigned trainers table
CREATE TABLE public.assigned_trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id),
  user_id uuid NOT NULL,
  trainer_name text,
  trainer_email text,
  trainer_phone text,
  assignment_date timestamp with time zone DEFAULT now(),
  status text DEFAULT 'pending', -- pending, assigned, active
  notes text
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_trainers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans
FOR SELECT
USING (is_active = true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS Policies for assigned_trainers
CREATE POLICY "Users can view their assigned trainer"
ON public.assigned_trainers
FOR SELECT
USING (user_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default premium plan
INSERT INTO public.subscription_plans (name, description, price_inr, duration_days, features, is_active)
VALUES (
  'Premium Personal Trainer Plan',
  'Elite Fitness Coaching with personalized workout and diet plans',
  10,
  30,
  '["Personalized workout plans", "Dedicated personal trainer", "Custom diet and nutrition plans", "Gym workout schedules", "Progress tracking", "Priority customer support", "Ad-free experience"]'::jsonb,
  true
);