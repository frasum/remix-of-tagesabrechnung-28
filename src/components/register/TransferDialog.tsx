import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { format } from 'date-fns';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    transfer_date: string;
    amount: number;
    direction: 'to_restaurant' | 'to_safe';
    reason: string | null;
    restaurant_id: string;
  }) => void;
  restaurantId: string;
  isPending: boolean;
}

export function TransferDialog({
  open,
  onOpenChange,
  onSubmit,
  restaurantId,
  isPending,
}: TransferDialogProps) {
  const [direction, setDirection] = useState<'to_restaurant' | 'to_safe'>('to_restaurant');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    onSubmit({
      transfer_date: date,
      amount,
      direction,
      reason: reason.trim() || null,
      restaurant_id: restaurantId,
    });

    // Reset form
    setAmount(0);
    setReason('');
    setDirection('to_restaurant');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer erfassen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Richtung</Label>
            <RadioGroup
              value={direction}
              onValueChange={(value) => setDirection(value as 'to_restaurant' | 'to_safe')}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="to_restaurant" id="to_restaurant" />
                <Label htmlFor="to_restaurant" className="cursor-pointer flex-1">
                  Tresor → Restaurant-Kasse
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="to_safe" id="to_safe" />
                <Label htmlFor="to_safe" className="cursor-pointer flex-1">
                  Restaurant-Kasse → Tresor
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Datum</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Betrag</Label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              placeholder="0,00 €"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Grund (optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="z.B. Trinkgeld Auszahlung"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={amount <= 0 || isPending}>
              {isPending ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
