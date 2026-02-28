ALTER TABLE public.waiter_shifts
  ADD COLUMN shift_start time without time zone DEFAULT '16:00',
  ADD COLUMN shift_end time without time zone,
  ADD COLUMN hours_worked numeric;