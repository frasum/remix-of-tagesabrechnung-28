import { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const WEBAUTHN_PROMPT_DISMISSED_KEY = 'webauthn_prompt_dismissed';

interface WebAuthnRegistrationPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebAuthnRegistrationPrompt({ open, onOpenChange }: WebAuthnRegistrationPromptProps) {
  const { register, isLoading, isSupported } = useWebAuthn();
  const { user } = useAuth();
  const { toast } = useToast();
  const [registering, setRegistering] = useState(false);

  if (!isSupported || !user?.staffId) return null;

  const handleRegister = async () => {
    setRegistering(true);
    const deviceName = navigator.userAgent.includes('iPhone')
      ? 'iPhone'
      : navigator.userAgent.includes('iPad')
      ? 'iPad'
      : navigator.userAgent.includes('Android')
      ? 'Android'
      : navigator.userAgent.includes('Mac')
      ? 'Mac'
      : 'Gerät';

    const success = await register(user.staffId!, `${deviceName} von ${user.name}`);
    setRegistering(false);

    if (success) {
      toast({
        title: 'Face ID aktiviert!',
        description: 'Sie können sich ab jetzt biometrisch anmelden.',
      });
      onOpenChange(false);
    } else {
      toast({
        title: 'Aktivierung fehlgeschlagen',
        description: 'Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(WEBAUTHN_PROMPT_DISMISSED_KEY, 'true');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Fingerprint className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Schneller anmelden</DialogTitle>
          <DialogDescription className="text-center">
            Aktivieren Sie Face ID / Touch ID für dieses Gerät, um sich beim nächsten Mal ohne PIN anzumelden.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleRegister}
            disabled={registering || isLoading}
            className="w-full"
          >
            <Fingerprint className="w-4 h-4 mr-2" />
            {registering ? 'Aktivieren...' : 'Face ID / Touch ID aktivieren'}
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="w-full"
          >
            Nicht jetzt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function shouldShowWebAuthnPrompt(): boolean {
  if (localStorage.getItem(WEBAUTHN_PROMPT_DISMISSED_KEY)) return false;
  if (localStorage.getItem('webauthn_credential_id')) return false;
  if (!window.PublicKeyCredential) return false;
  return true;
}
