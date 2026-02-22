
-- WebAuthn credentials table
CREATE TABLE public.webauthn_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WebAuthn challenges table (temporary, short TTL)
CREATE TABLE public.webauthn_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge TEXT NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('register', 'authenticate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 minutes')
);

-- Enable RLS
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- RLS: No direct client access, only via service role (edge functions)
CREATE POLICY "No direct read webauthn_credentials"
  ON public.webauthn_credentials FOR SELECT
  USING (false);

CREATE POLICY "No direct insert webauthn_credentials"
  ON public.webauthn_credentials FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update webauthn_credentials"
  ON public.webauthn_credentials FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete webauthn_credentials"
  ON public.webauthn_credentials FOR DELETE
  USING (false);

CREATE POLICY "No direct read webauthn_challenges"
  ON public.webauthn_challenges FOR SELECT
  USING (false);

CREATE POLICY "No direct insert webauthn_challenges"
  ON public.webauthn_challenges FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update webauthn_challenges"
  ON public.webauthn_challenges FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete webauthn_challenges"
  ON public.webauthn_challenges FOR DELETE
  USING (false);

-- Index for fast credential lookup
CREATE INDEX idx_webauthn_credentials_staff_id ON public.webauthn_credentials(staff_id);
CREATE INDEX idx_webauthn_credentials_credential_id ON public.webauthn_credentials(credential_id);

-- Auto-cleanup expired challenges
CREATE INDEX idx_webauthn_challenges_expires_at ON public.webauthn_challenges(expires_at);
