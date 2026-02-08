import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { RegisterTransfer } from '@/hooks/useRegisterTransfers';

interface TransferListProps {
  transfers: RegisterTransfer[];
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function TransferList({ transfers, onDelete, isDeleting }: TransferListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (transfers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Noch keine Transfers erfasst.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transfers.map((transfer) => (
        <div
          key={transfer.id}
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {format(parseISO(transfer.transfer_date), 'dd.MM.yyyy', { locale: de })}
            </div>
            <div className="font-medium whitespace-nowrap">
              {formatCurrency(transfer.amount)}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{transfer.direction === 'to_restaurant' ? 'Tresor' : 'Restaurant'}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{transfer.direction === 'to_restaurant' ? 'Restaurant' : 'Tresor'}</span>
            </div>
            {transfer.reason && (
              <div className="text-sm text-muted-foreground truncate hidden sm:block">
                "{transfer.reason}"
              </div>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Transfer löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Möchtest du diesen Transfer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(transfer.id)}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ))}
    </div>
  );
}
