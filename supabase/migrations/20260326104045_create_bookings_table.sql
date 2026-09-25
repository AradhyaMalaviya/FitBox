CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  booking_date date NOT NULL,
  start_time text,
  duration_hours integer,
  activities jsonb
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Enable insert for anonymous users'
  ) THEN
    CREATE POLICY "Enable insert for anonymous users" ON bookings FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'bookings' AND policyname = 'Enable read access for all users'
  ) THEN
    CREATE POLICY "Enable read access for all users" ON bookings FOR SELECT USING (true);
  END IF;
END $$;;
