import { useState } from 'react';
import { Link2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AccountLinkingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (staff: { id: string; name: string; role: string }) => void;
}

export function AccountLinkingDialog({ open, onOpenChange, onSuccess }: AccountLinkingDialogProps) {
  const [staffName, setStaffName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLink = async () => {
    if (!staffName.trim() || pinCode.length !== 4) {
      toast({
        title: 'Eingabe unvollständig',
        description: 'Bitte gib deinen Namen und 4-stelligen PIN ein.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Nicht eingeloggt');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/link-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ staffName: staffName.trim(), pinCode }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Verknüpfung fehlgeschlagen');
      }

      toast({
        title: 'Konto verknüpft',
        description: `Dein Konto wurde mit ${result.staff.name} verknüpft.`,
      });

      onSuccess(result.staff);
      onOpenChange(false);
      setStaffName('');
      setPinCode('');
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Verknüpfung fehlgeschlagen',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Konto verknüpfen
          </DialogTitle>
          <DialogDescription>
            Verknüpfe dein Google/Apple-Konto mit deinem bestehenden Mitarbeiter-Account, 
            um alle Funktionen zu nutzen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="staffName">Dein Mitarbeitername</Label>
            <Input
              id="staffName"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="z.B. Max Mustermann"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Dein 4-stelliger PIN</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={pinCode}
                onChange={setPinCode}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Später
          </Button>
          <Button
            onClick={handleLink}
            disabled={isLoading || !staffName.trim() || pinCode.length !== 4}
            className="flex-1"
          >
            {isLoading ? 'Verknüpfe...' : 'Verknüpfen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
