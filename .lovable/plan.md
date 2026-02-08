

## Vortages-Kassenbestand im Manager-Dashboard anzeigen

### Übersicht
Der Manager soll im Dashboard den **Kassenbestand vom Ende des Vortages** sehen, um zu wissen, mit welchem Betrag die Restaurant-Kasse heute gestartet ist.

### Berechnung
Der Kassenbestand vom Vortag ergibt sich aus:

```
Vortages-Kassenbestand = 1.000 € (Anfangsbestand) + Bargeld des Vortages + Transfers vom Tresor am Vortag
```

### Technische Umsetzung

**Datei: `src/pages/ManagerDashboard.tsx`**

| Änderung | Beschreibung |
|----------|--------------|
| Neue Berechnung | `previousDayRegisterBalance` berechnen |
| Session-Hook erweitern | Vortags-Session laden |
| UI hinzufügen | Neue Info-Zeile in der Bargeld-Kachel |

**Neue Logik (nach Zeile 246):**
```typescript
// Vortags-Datum berechnen
const previousDayStr = useMemo(() => {
  const prevDate = new Date(selectedDate);
  prevDate.setDate(prevDate.getDate() - 1);
  return format(prevDate, 'yyyy-MM-dd');
}, [selectedDate]);

// Vortags-Session laden (für Bargeld-Berechnung)
const { data: previousSession } = useSession(
  new Date(previousDayStr), 
  restaurantId
);
const { data: previousWaiterShifts = [] } = useWaiterShifts(previousSession?.id);
const { data: previousExpenses = [] } = useExpenses(previousSession?.id);

// Vortags-Bargeld berechnen (gleiche Formel wie in DailySummary)
const previousDayBargeld = useMemo(() => {
  if (!previousSession) return 0;
  
  const prevKellnerUmsatz = previousWaiterShifts.reduce((sum, w) => sum + (w.pos_sales || 0), 0);
  const prevHilfMahl = previousWaiterShifts.reduce((sum, w) => sum + (w.hilf_mahl || 0), 0);
  const prevOpenInvoices = previousWaiterShifts.reduce((sum, w) => sum + (w.open_invoices || 0), 0);
  const prevTotalExpenses = previousExpenses.reduce((sum, e) => sum + e.amount, 0);
  const prevDeliveryRevenue = (previousSession.ordersmart_revenue || 0) + 
                               (previousSession.wolt_revenue || 0) + 
                               (previousSession.takeaway_total || 0);

  return prevKellnerUmsatz +
    (previousSession.vouchers_sold || 0) +
    (previousSession.sonstige_einnahme || 0) -
    (previousSession.terminal_1_total || 0) -
    (previousSession.terminal_2_total || 0) -
    (previousSession.vouchers_redeemed || 0) -
    (previousSession.vorschuss || 0) -
    (previousSession.einladung || 0) -
    prevOpenInvoices -
    prevTotalExpenses +
    prevHilfMahl -
    prevDeliveryRevenue -
    (previousSession.finedine_vouchers || 0);
}, [previousSession, previousWaiterShifts, previousExpenses]);

// Vortags-Transfers vom Tresor
const previousDayVaultTransfers = useMemo(() => {
  return transfers
    .filter(t => t.direction === 'to_restaurant' && t.transfer_date === previousDayStr)
    .reduce((sum, t) => sum + t.amount, 0);
}, [transfers, previousDayStr]);

// Kassenbestand vom Vortag (= Startbestand heute)
const previousDayRegisterBalance = balances.initialRestaurant + previousDayBargeld + previousDayVaultTransfers;
```

**UI in der Bargeld-Kachel (Zeile 364-392):**

```jsx
<Card className="border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 lg:col-start-3 md:col-span-2 lg:col-span-1">
  <CardHeader className="pb-2">
    <CardTitle className="flex items-center gap-2 text-lg">
      <Banknote className="w-5 h-5" />
      Kassenstand
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {/* NEU: Kassenbestand Vortag (= Startbestand heute) */}
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Kassenbestand Vortag</span>
      <span className="font-semibold tabular-nums">
        {formatCurrency(previousDayRegisterBalance)}
      </span>
    </div>

    {/* Bargeld heute (Vorschau) */}
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Bargeld heute (Vorschau)</span>
      <span className={`font-semibold tabular-nums ${bargeldPreview >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
        {formatCurrency(bargeldPreview)}
      </span>
    </div>
    
    <Separator />

    {/* Kassenstand nach heute */}
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium">Kassenstand nach heute</span>
      <span className={`text-lg font-bold tabular-nums ${(previousDayRegisterBalance + bargeldPreview) >= balances.initialRestaurant ? 'text-emerald-600' : 'text-destructive'}`}>
        {formatCurrency(previousDayRegisterBalance + bargeldPreview)}
      </span>
    </div>

    {/* Transfer-Button wenn Kassenstand < 1.000 € */}
    {(previousDayRegisterBalance + bargeldPreview) < balances.initialRestaurant && (
      <Button onClick={() => setShowTransferDialog(true)} variant="outline" className="w-full gap-2">
        <Vault className="w-4 h-4" />
        Transfer vom Tresor
      </Button>
    )}
  </CardContent>
</Card>
```

### Beispiel-Darstellung

```text
┌─────────────────────────────────────────────────────────────────────┐
│  💵 KASSENSTAND                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│     Kassenbestand Vortag:            1.350,00 €  ← NEU              │
│     Bargeld heute (Vorschau):         -200,00 €                     │
│     ─────────────────────────────────────────────                   │
│     Kassenstand nach heute:          1.150,00 €                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Wann wird die Kachel angezeigt?

Die Kachel-Sichtbarkeit wird angepasst:
- Vorher: `currentRegisterBalance < 0` (kumuliert)
- Nachher: `(previousDayRegisterBalance + bargeldPreview) < balances.initialRestaurant` (unter 1.000 €)

### Zusammenfassung

| Bereich | Änderung |
|---------|----------|
| Neue Hooks | `previousSession`, `previousWaiterShifts`, `previousExpenses` |
| Neue Berechnungen | `previousDayBargeld`, `previousDayVaultTransfers`, `previousDayRegisterBalance` |
| UI | Neue Zeile "Kassenbestand Vortag" in Bargeld-Kachel |
| Kachel-Sichtbarkeit | Basiert auf `previousDayRegisterBalance + bargeldPreview < 1.000 €` |
| Entfernen | `useCashBalanceData` Hook (kumulierte Logik nicht mehr nötig) |

