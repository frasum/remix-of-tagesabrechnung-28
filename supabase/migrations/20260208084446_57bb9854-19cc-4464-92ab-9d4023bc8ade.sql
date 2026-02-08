-- Add staff_id to profiles table for account linking
ALTER TABLE public.profiles
ADD COLUMN staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_profiles_staff_id ON public.profiles(staff_id);

-- Allow staff lookups for linking (public read for active staff names only)
CREATE POLICY "Allow reading active staff for linking"
ON public.staff
FOR SELECT
USING (is_active = true);