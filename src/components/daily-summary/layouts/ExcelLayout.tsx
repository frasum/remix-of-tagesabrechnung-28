import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface WaiterShiftData {
  id: string;
  waiter_name: string;
  kassiert_brutto: number | null;
  card_total: number | null;
  hilf_mahl: number | null;
  open_invoices: number | null;
  cash_handed_in: number | null;
  kitchen_tip: number | null;
  pos_sales: number | null;
  submitted_at?: string | null;
  second_waiter_name?: string | null;
  participates_in_pool?: boolean;
}

interface ExcelLayoutProps {
  warnings: ReactNode;
  expenses: ReactNode;
  cashBalanceCard: ReactNode;
  waiterShifts: WaiterShiftData[];
  formData: {
    pos_total: number;
    terminal_1_total: number;
    terminal_2_total: number;
    card_total_gl: number;
    takeaway_total: number;
    ordersmart_revenue: number;
    wolt_revenue: number;
    vouchers_sold: number;
    vouchers_redeemed: number;
    finedine_vouchers: number;
    vorschuss: number;
    einladung: number;
    sonstige_einnahme: number;
    notes: string;
  };
  onFieldChange: (field: string, value: number | string) => void;
  // Calculated totals
  totalKassiertBrutto: number;
  kellnerUmsatz: number;
  totalCardTotal: number;
  totalDeliveryRevenue: number;
  totalOpenInvoices: number;
  totalExpenses: number;
  totalKitchenTip: number;
  waiterTipPool: number;
  waiterShareCount: number;
  tipPerWaiter: number;
  uniqueKitchenStaff: number;
  tipPerKitchen: number;
  bargeld: number;
}

export function ExcelLayout({
  warnings,
  expenses,
  cashBalanceCard,
  waiterShifts,
  formData,
  onFieldChange,
  totalKassiertBrutto,
  kellnerUmsatz,
  totalCardTotal,
  totalDeliveryRevenue,
  totalOpenInvoices,
  totalExpenses,
  totalKitchenTip,
  waiterTipPool,
  waiterShareCount,
  tipPerWaiter,
  uniqueKitchenStaff,
  tipPerKitchen,
  bargeld,
}: ExcelLayoutProps) {
  const fmt = (value: number) =>
    new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  const fmtCurrency = (value: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);

  const terminalTotal = formData.terminal_1_total + formData.terminal_2_total;

  // Calculate expected cash per waiter
  const calcExpected = (w: WaiterShiftData) =>
    (w.kassiert_brutto || 0) + (w.hilf_mahl || 0) - (w.open_invoices || 0) - (w.card_total || 0);

  return (
    <div className="space-y-4">
      {warnings}

      {/* Main Excel-style two-column layout */}
      <div className="grid lg:grid-cols-[minmax(320px,2fr)_minmax(400px,3fr)] gap-4">
        {/* LEFT COLUMN - Hauptdaten */}
        <div className="space-y-0">
          <div className="border rounded-lg overflow-hidden">
            {/* Section: Umsatz */}
            <div className="bg-muted/30 px-3 py-1.5 border-b">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Umsatz</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <ExcelInputRow label="Vectron Gesamtumsatz" value={formData.pos_total} onChange={(v) => onFieldChange('pos_total', v)} />
                <ExcelReadonlyRow label="Kellner Umsatz" value={kellnerUmsatz} />
                <ExcelReadonlyRow label="Kellner Abzugeben" value={totalKassiertBrutto} />
                <ExcelReadonlyRow label="Differenz" value={formData.pos_total - kellnerUmsatz} highlight={Math.abs(formData.pos_total - kellnerUmsatz - formData.takeaway_total) >= 0.01 ? 'warning' : undefined} />
              </tbody>
            </table>

            {/* Section: Kredit Karten */}
            <div className="bg-muted/30 px-3 py-1.5 border-y">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kredit Karten</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <ExcelInputRow label="Terminal 1" value={formData.terminal_1_total} onChange={(v) => onFieldChange('terminal_1_total', v)} />
                <ExcelInputRow label="Terminal 2" value={formData.terminal_2_total} onChange={(v) => onFieldChange('terminal_2_total', v)} />
                <ExcelInputRow label="KK Umsatz GL" value={formData.card_total_gl} onChange={(v) => onFieldChange('card_total_gl', v)} />
                <ExcelReadonlyRow label="KK Gesamt" value={totalCardTotal} bold />
              </tbody>
            </table>

            {/* Section: Take Away */}
            <div className="bg-muted/30 px-3 py-1.5 border-y">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Take Away</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <ExcelInputRow label="Takeaway GL" value={formData.takeaway_total} onChange={(v) => onFieldChange('takeaway_total', v)} />
                <ExcelInputRow label="OrderSmart" value={formData.ordersmart_revenue} onChange={(v) => onFieldChange('ordersmart_revenue', v)} />
                <ExcelInputRow label="Wolt" value={formData.wolt_revenue} onChange={(v) => onFieldChange('wolt_revenue', v)} />
                <ExcelReadonlyRow label="Take-Away Gesamt" value={totalDeliveryRevenue} bold />
              </tbody>
            </table>

            {/* Section: Gutscheine */}
            <div className="bg-muted/30 px-3 py-1.5 border-y">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gutscheine & Sonstiges</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <ExcelInputRow label="Gutschein Verkauf" value={formData.vouchers_sold} onChange={(v) => onFieldChange('vouchers_sold', v)} />
                <ExcelInputRow label="Gutschein Eingelöst" value={formData.vouchers_redeemed} onChange={(v) => onFieldChange('vouchers_redeemed', v)} />
                <ExcelInputRow label="FineDine" value={formData.finedine_vouchers} onChange={(v) => onFieldChange('finedine_vouchers', v)} />
                <ExcelReadonlyRow label="Offene Rechnungen" value={totalOpenInvoices} />
                <ExcelInputRow label="Vorschuss" value={formData.vorschuss} onChange={(v) => onFieldChange('vorschuss', v)} />
                <ExcelInputRow label="Einladung" value={formData.einladung} onChange={(v) => onFieldChange('einladung', v)} />
                <ExcelInputRow label="Sonstige Einnahmen" value={formData.sonstige_einnahme} onChange={(v) => onFieldChange('sonstige_einnahme', v)} />
                <ExcelReadonlyRow label="Ausgaben" value={-totalExpenses} />
              </tbody>
            </table>

            {/* BARGELD - highlighted */}
            <div className="bg-primary/10 border-y-2 border-primary/30">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="px-3 py-2.5 font-bold text-base">BARGELD</td>
                    <td className={`px-3 py-2.5 text-right tabular-nums font-bold text-base ${bargeld >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {fmt(bargeld)} €
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Kitchen tip */}
            <table className="w-full text-sm">
              <tbody>
                <ExcelReadonlyRow label="2% Trinkgeld Küche" value={totalKitchenTip} />
                {uniqueKitchenStaff > 0 && (
                  <ExcelReadonlyRow label={`→ Pro Küche (${uniqueKitchenStaff} MA)`} value={tipPerKitchen} muted />
                )}
              </tbody>
            </table>
          </div>

          {/* Expenses below left column */}
          <div className="mt-4">
            {expenses}
          </div>

          {cashBalanceCard}
        </div>

        {/* RIGHT COLUMN - Kellner + Tip Pool + Notizen */}
        <div className="space-y-4">
          {/* Horizontal Waiter Table */}
          {waiterShifts.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-3 py-1.5 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kellner</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground w-28"></th>
                      {waiterShifts.map((w) => (
                        <th key={w.id} className="px-3 py-2 text-center font-semibold min-w-[110px]">
                          {w.waiter_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <WaiterRow label="Abzugeben" shifts={waiterShifts} getValue={(w) => w.kassiert_brutto || 0} fmt={fmt} />
                    <WaiterRow label="Kredit Karten" shifts={waiterShifts} getValue={(w) => w.card_total || 0} fmt={fmt} />
                    <WaiterRow label="Hilf Mahl" shifts={waiterShifts} getValue={(w) => w.hilf_mahl || 0} fmt={fmt} />
                    <WaiterRow label="Offene Rechn." shifts={waiterShifts} getValue={(w) => w.open_invoices || 0} fmt={fmt} />
                    <WaiterRow label="Soll Bargeld" shifts={waiterShifts} getValue={calcExpected} fmt={fmt} className="border-t bg-muted/10" />
                    <WaiterRow label="Abgegeben" shifts={waiterShifts} getValue={(w) => w.cash_handed_in || 0} fmt={fmt} bold />
                    <WaiterRow
                      label="Trinkgeld Küche"
                      shifts={waiterShifts}
                      getValue={(w) => w.kitchen_tip || 0}
                      fmt={fmt}
                      renderCell={(w) => {
                        const tip = w.kitchen_tip || 0;
                        const brutto = w.kassiert_brutto || 0;
                        const pct = brutto > 0 ? ((tip / brutto) * 100).toFixed(1) : '0.0';
                        return (
                          <span>
                            {fmt(tip)}
                            <span className="text-xs text-muted-foreground ml-1">({pct}%)</span>
                          </span>
                        );
                      }}
                    />
                    <WaiterRow
                      label="Kellner-TG"
                      shifts={waiterShifts}
                      getValue={(w) => (w.cash_handed_in || 0) - calcExpected(w) - (w.kitchen_tip || 0)}
                      fmt={fmt}
                      className="border-t-2 font-semibold"
                      colorize
                    />
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tip Pool */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-3 py-1.5 border-b">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trinkgeld Pool</span>
            </div>
            <div className="px-3 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span>Küchen-TG Gesamt</span>
                <span className="tabular-nums font-semibold text-success">{fmtCurrency(totalKitchenTip)}</span>
              </div>
              {uniqueKitchenStaff > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>→ Küche ({uniqueKitchenStaff} MA)</span>
                  <span className="tabular-nums">{fmtCurrency(tipPerKitchen)}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between">
                <span>Kellner-TG Pool</span>
                <span className="tabular-nums font-semibold text-success">{fmtCurrency(waiterTipPool)}</span>
              </div>
              {waiterShareCount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>→ Pro Kellner ({waiterShareCount})</span>
                  <span className="tabular-nums">{fmtCurrency(tipPerWaiter)}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between font-bold">
                <span>TG Gesamt</span>
                <span className="tabular-nums text-success">{fmtCurrency(totalKitchenTip + waiterTipPool)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-3 py-1.5 border-b">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notizen</span>
            </div>
            <div className="p-3">
              <Textarea
                placeholder="Notizen für diesen Tag..."
                value={formData.notes}
                onChange={(e) => onFieldChange('notes', e.target.value)}
                rows={3}
                className="border-0 bg-transparent p-0 focus-visible:ring-0 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components for compact Excel-style rows

function ExcelInputRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="px-3 py-1.5 font-medium text-foreground">{label}</td>
      <td className="px-3 py-1.5 w-36">
        <CurrencyInput value={value} onChange={onChange} className="h-7 text-sm border-primary/20 bg-primary/5" />
      </td>
    </tr>
  );
}

function ExcelReadonlyRow({
  label,
  value,
  bold,
  highlight,
  muted,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: 'warning' | 'error';
  muted?: boolean;
}) {
  const fmt = (v: number) =>
    new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  return (
    <tr className={`border-b last:border-b-0 ${highlight === 'warning' ? 'bg-warning/10' : ''}`}>
      <td className={`px-3 py-1.5 ${bold ? 'font-semibold' : 'font-medium'} ${muted ? 'text-muted-foreground pl-6' : 'text-foreground'}`}>
        {label}
      </td>
      <td className={`px-3 py-1.5 text-right tabular-nums w-36 ${bold ? 'font-semibold' : ''} ${highlight ? 'text-warning font-medium' : ''}`}>
        {fmt(value)} €
      </td>
    </tr>
  );
}

function WaiterRow({
  label,
  shifts,
  getValue,
  fmt,
  bold,
  className,
  colorize,
  renderCell,
}: {
  label: string;
  shifts: WaiterShiftData[];
  getValue: (w: WaiterShiftData) => number;
  fmt: (v: number) => string;
  bold?: boolean;
  className?: string;
  colorize?: boolean;
  renderCell?: (w: WaiterShiftData) => ReactNode;
}) {
  return (
    <tr className={`border-b last:border-b-0 ${className || ''}`}>
      <td className={`px-3 py-1.5 ${bold ? 'font-semibold' : 'font-medium'} text-muted-foreground`}>
        {label}
      </td>
      {shifts.map((w) => {
        const val = getValue(w);
        return (
          <td
            key={w.id}
            className={`px-3 py-1.5 text-right tabular-nums ${bold ? 'font-semibold' : ''} ${colorize ? (val >= 0 ? 'text-success' : 'text-destructive') : ''}`}
          >
            {renderCell ? renderCell(w) : `${fmt(val)}`}
          </td>
        );
      })}
    </tr>
  );
}
