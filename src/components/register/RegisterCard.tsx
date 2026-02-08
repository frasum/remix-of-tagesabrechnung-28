import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegisterCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  initialAmount: number;
  transferAmount: number;
  currentBalance: number;
  isPositiveTransfer: boolean;
}

export function RegisterCard({
  title,
  subtitle,
  icon: Icon,
  initialAmount,
  transferAmount,
  currentBalance,
  isPositiveTransfer,
}: RegisterCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Anfangsbestand:</span>
          <span>{formatCurrency(initialAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Transfers:</span>
          <span className={cn(
            transferAmount !== 0 && (isPositiveTransfer ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive')
          )}>
            {transferAmount > 0 ? (isPositiveTransfer ? '+' : '-') : ''}
            {formatCurrency(Math.abs(transferAmount))}
          </span>
        </div>
        <div className="border-t pt-3 flex justify-between font-medium">
          <span>Aktueller Bestand:</span>
          <span className={cn(
            'text-lg',
            currentBalance < initialAmount * 0.3 && 'text-amber-600 dark:text-amber-500'
          )}>
            {formatCurrency(currentBalance)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
