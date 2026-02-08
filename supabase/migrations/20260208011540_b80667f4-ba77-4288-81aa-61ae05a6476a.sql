-- Phase 1: Create restaurants table
CREATE TABLE public.restaurants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (public access like other tables)
CREATE POLICY "Allow public access to restaurants" 
ON public.restaurants 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Insert initial restaurants
INSERT INTO public.restaurants (name, slug) VALUES 
  ('Spicery', 'spicery'),
  ('YUM', 'yum');

-- Phase 2: Add restaurant_id to sessions table
ALTER TABLE public.sessions ADD COLUMN restaurant_id uuid;

-- Set all existing sessions to Spicery
UPDATE public.sessions 
SET restaurant_id = (SELECT id FROM public.restaurants WHERE slug = 'spicery');

-- Now make it NOT NULL and add foreign key
ALTER TABLE public.sessions 
ALTER COLUMN restaurant_id SET NOT NULL,
ADD CONSTRAINT sessions_restaurant_id_fkey 
  FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);

-- Phase 3: Add restaurant_id to bank_deposits table
ALTER TABLE public.bank_deposits ADD COLUMN restaurant_id uuid;

-- Set all existing deposits to Spicery
UPDATE public.bank_deposits 
SET restaurant_id = (SELECT id FROM public.restaurants WHERE slug = 'spicery');

-- Now make it NOT NULL and add foreign key
ALTER TABLE public.bank_deposits 
ALTER COLUMN restaurant_id SET NOT NULL,
ADD CONSTRAINT bank_deposits_restaurant_id_fkey 
  FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);

-- Phase 4: Add restaurant_id to settings table
ALTER TABLE public.settings ADD COLUMN restaurant_id uuid;

-- Set all existing settings to Spicery
UPDATE public.settings 
SET restaurant_id = (SELECT id FROM public.restaurants WHERE slug = 'spicery');

-- Now make it NOT NULL and add foreign key
ALTER TABLE public.settings 
ALTER COLUMN restaurant_id SET NOT NULL,
ADD CONSTRAINT settings_restaurant_id_fkey 
  FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);

-- Drop old unique constraint on key only and add new composite constraint
ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS settings_key_key;

ALTER TABLE public.settings 
ADD CONSTRAINT settings_key_restaurant_unique UNIQUE (key, restaurant_id);