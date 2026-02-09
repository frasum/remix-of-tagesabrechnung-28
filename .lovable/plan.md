
# Readonly-Zeilen nur bei Wert > 0 anzeigen

## Ziel
Die Zeilen "Offene Rechnungen", "Vorschuss" und "Ausgaben" sollen nur dann sichtbar sein, wenn sie einen Betrag ungleich 0 enthalten. So wird die Ansicht kompakter, wenn an einem Tag keine entsprechenden Werte vorliegen.

## Aenderung in `src/components/daily-summary/layouts/ExcelLayout.tsx`

Die drei `ExcelReadonlyRow`-Aufrufe in der Sektion "Gutscheine & Sonstiges" werden jeweils in eine Bedingung gewrappt:

- **Offene Rechnungen**: nur anzeigen wenn `totalOpenInvoices !== 0`
- **Vorschuss**: nur anzeigen wenn `totalAdvances !== 0`
- **Ausgaben**: nur anzeigen wenn `totalExpenses !== 0`

```tsx
{totalOpenInvoices !== 0 && (
  <ExcelReadonlyRow label="Offene Rechnungen" value={totalOpenInvoices} />
)}
{totalAdvances !== 0 && (
  <ExcelReadonlyRow label="Vorschuss" value={totalAdvances} />
)}
{totalExpenses !== 0 && (
  <ExcelReadonlyRow label="Ausgaben" value={-totalExpenses} />
)}
```

Keine weiteren Dateien oder Abhaengigkeiten betroffen.
