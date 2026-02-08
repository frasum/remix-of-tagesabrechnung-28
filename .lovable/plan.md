

## Plan: Tagesumsatz-Berechnung korrigieren

### Problem
Die StatCard "Tagesumsatz" und die Einnahmen-Übersicht zeigen `kellnerUmsatz` (nur Kellner-pos_sales), aber es fehlt der Takeaway-Umsatz. Der angezeigte Wert (6.684,50 €) ist um genau den Takeaway-Betrag niedriger als der tatsächliche Tagesumsatz (7.168,70 €).

### Lösung
Der "Tagesumsatz" sollte der **Vectron Gesamtumsatz** (`formData.pos_total`) sein - also der Wert, der manuell vom Kassensystem eingegeben wird. Dies entspricht der Logik in `useCashBalanceData.ts`.

---

## Änderungen in DailySummary.tsx

### 1. StatCard "Tagesumsatz" korrigieren (ca. Zeile 438-441)

**Vorher:**
```tsx
<StatCard
  label="Tagesumsatz"
  value={kellnerUmsatz}
  icon={<FileText className="w-5 h-5" />}
/>
```

**Nachher:**
```tsx
<StatCard
  label="Tagesumsatz"
  value={formData.pos_total}
  icon={<FileText className="w-5 h-5" />}
/>
```

### 2. Einnahmen-Übersicht Tabelle korrigieren (ca. Zeile 752-754)

**Vorher:**
```tsx
<TableRow>
  <TableCell className="py-2">Tagesumsatz</TableCell>
  <TableCell className="text-right tabular-nums py-2">{formatCurrency(kellnerUmsatz)}</TableCell>
</TableRow>
```

**Nachher:**
```tsx
<TableRow>
  <TableCell className="py-2">Tagesumsatz (Vectron)</TableCell>
  <TableCell className="text-right tabular-nums py-2">{formatCurrency(formData.pos_total)}</TableCell>
</TableRow>
```

### 3. Summenberechnung in Einnahmen-Übersicht anpassen (ca. Zeile 768-773)

**Vorher:**
```tsx
<TableCell className="text-right tabular-nums font-semibold text-success py-2">
  {formatCurrency(kellnerUmsatz + formData.vouchers_sold + formData.sonstige_einnahme + totalHilfMahl)}
</TableCell>
```

**Nachher:**
```tsx
<TableCell className="text-right tabular-nums font-semibold text-success py-2">
  {formatCurrency(formData.pos_total + formData.vouchers_sold + formData.sonstige_einnahme + totalHilfMahl)}
</TableCell>
```

---

## Zusammenfassung der Änderungen

| Stelle | Vorher | Nachher |
|--------|--------|---------|
| StatCard "Tagesumsatz" | `kellnerUmsatz` | `formData.pos_total` |
| Einnahmen-Tabelle "Tagesumsatz" | `kellnerUmsatz` | `formData.pos_total` |
| Einnahmen-Summe | basiert auf `kellnerUmsatz` | basiert auf `formData.pos_total` |

---

## Dateien

| Datei | Änderung |
|-------|----------|
| `src/pages/DailySummary.tsx` | 3 Stellen korrigieren |

---

## Erwartetes Ergebnis

Nach der Korrektur:
- **Tagesumsatz** zeigt den Vectron Gesamtwert (7.168,70 €)
- **Einnahmen-Summe** basiert auf dem korrekten Tagesumsatz
- Die Werte stimmen mit deiner manuellen Abrechnung überein

