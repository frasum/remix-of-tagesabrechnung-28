-- Neue Tabelle für Kassentransfers zwischen Tresor und Restaurant-Kasse
CREATE TABLE public.register_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  transfer_date DATE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  direction TEXT NOT NULL CHECK (direction IN ('to_restaurant', 'to_safe')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.register_transfers ENABLE ROW LEVEL SECURITY;

-- Policy für App-Zugriff
CREATE POLICY "Allow register transfers access via app" 
ON public.register_transfers FOR ALL USING (true);

-- Index für Performance
CREATE INDEX idx_register_transfers_restaurant 
ON public.register_transfers(restaurant_id, transfer_date DESC);