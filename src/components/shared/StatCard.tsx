import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendData {
  value: number;
  label: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
  trend?: TrendData;
}

export function StatCard({ label, value, icon, variant = 'default', className, trend }: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(val);
    }
    return val;
  };

  const formatPercent = (val: number) => {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
  };

  return (
    <div
      className={cn(
        "stat-card",
        variant === 'success' && "border-success/30 bg-success/5",
        variant === 'warning' && "border-warning/30 bg-warning/5",
        variant === 'error' && "border-destructive/30 bg-destructive/5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p
            className={cn(
              "text-2xl font-display font-semibold tabular-nums",
              variant === 'success' && "text-success",
              variant === 'warning' && "text-warning",
              variant === 'error' && "text-destructive"
            )}
          >
            {formatValue(value)}
          </p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-1 text-xs",
              trend.value > 0 ? "text-success" : trend.value < 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {trend.value > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : trend.value < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              <span className="tabular-nums font-medium">{formatPercent(trend.value)}</span>
              <span className="text-muted-foreground">vs. {trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              variant === 'default' && "bg-primary/10 text-primary",
              variant === 'success' && "bg-success/15 text-success",
              variant === 'warning' && "bg-warning/15 text-warning",
              variant === 'error' && "bg-destructive/15 text-destructive"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
