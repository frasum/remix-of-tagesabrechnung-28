import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingDown, Pencil, Check, X } from 'lucide-react';
import { useInitialCashDeficit } from '@/hooks/useSettings';
import { useRestaurant } from '@/hooks/useRestaurant';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

export function InitialDeficitSetting() {
  const { restaurantId } = useRestaurant();
  const { initialDeficit, updateInitialDeficit, isUpdating } = useInitialCashDeficit(restaurantId);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleEdit = () => {
    setEditValue(initialDeficit.toString().replace('.', ','));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleSave = () => {
    if (!restaurantId) {
      toast.error('Restaurant nicht gefunden');
      return;
    }

    const numValue = parseFloat(editValue.replace(',', '.'));
    if (isNaN(numValue)) {
      toast.error('Bitte geben Sie einen gültigen Betrag ein');
      return;
    }

    updateInitialDeficit({ amount: numValue, restaurantId }, {
      onSuccess: () => {
        toast.success('Anfangs-Fehlbetrag aktualisiert');
        setIsEditing(false);
      },
      onError: () => {
        toast.error('Fehler beim Speichern');
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TrendingDown className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Fehlbetrag Vortag (Excel)</span>

      {isEditing ? (
        <div className="flex items-center gap-1">
          <Input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-28 h-7 text-sm"
            autoFocus
            disabled={isUpdating}
            placeholder="-244,53"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleSave}
            disabled={isUpdating}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium tabular-nums">
            {formatCurrency(initialDeficit)}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={handleEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
