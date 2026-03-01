import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StatsSummary } from '@/hooks/useStatistics';

interface RestaurantComparisonProps {
  restaurants: { name: string; summary: StatsSummary }[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);

interface MetricRowProps {
  label: string;
  values: number[];
}

function MetricRow({ label, values }: MetricRowProps) {
  const max = Math.max(...values);
  return (
    <div className="grid gap-4 items-center py-3 border-b last:border-b-0" style={{ gridTemplateColumns: `1fr repeat(${values.length}, 1fr)` }}>
      <div className="font-medium text-sm">{label}</div>
      {values.map((v, i) => (
        <div key={i} className={`text-right tabular-nums text-sm ${v === max && max > 0 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
          {formatCurrency(v)}
        </div>
      ))}
    </div>
  );
}

export function RestaurantComparison({ restaurants }: RestaurantComparisonProps) {
  if (restaurants.length < 2) return null;

  const metrics: { label: string; key: keyof StatsSummary; invert?: boolean }[] = [
    { label: 'Gesamtumsatz', key: 'totalRevenue' },
    { label: 'Ø Tagesumsatz', key: 'avgDailyRevenue' },
    { label: 'Küchen TG', key: 'totalKitchenTip' },
    { label: 'Mitarbeiter TG Pool', key: 'totalWaiterTip' },
    { label: 'Lieferumsatz', key: 'totalDelivery' },
    { label: 'Ausgaben', key: 'totalExpenses', invert: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Restaurant-Vergleich
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header */}
        <div className="grid gap-4 pb-2 border-b-2 mb-2" style={{ gridTemplateColumns: `1fr repeat(${restaurants.length}, 1fr)` }}>
          <div className="text-sm font-medium text-muted-foreground">Kennzahl</div>
          {restaurants.map(r => (
            <div key={r.name} className="text-right text-sm font-medium text-muted-foreground">{r.name}</div>
          ))}
        </div>

        {metrics.map(m => (
          <MetricRow
            key={m.key}
            label={m.label}
            values={restaurants.map(r => r.summary[m.key] as number)}
          />
        ))}

        {/* Days */}
        <div className="mt-4 pt-4 border-t grid gap-4" style={{ gridTemplateColumns: `1fr repeat(${restaurants.length}, 1fr)` }}>
          <span className="text-sm text-muted-foreground">Tage mit Daten</span>
          {restaurants.map(r => (
            <div key={r.name} className="text-right text-sm tabular-nums font-medium">{r.summary.daysWithData}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
