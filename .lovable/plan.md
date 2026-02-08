
## Korrektur der BARGELD-Berechnung

### Zusammenfassung des Problems
Die BARGELD-Berechnung in `DailySummary.tsx` und `ManagerDashboard.tsx` verwendet eine **fehlerhafte Formel**, die zu falschen Ergebnissen führt. Ihre manuelle Berechnung von **265,88 €** ist korrekt.

### Ursache des Fehlers

Es gibt zwei unterschiedliche Formeln in der App:

| Datei | Basis-Umsatz | Delivery-Abzug | Ergebnis |
|-------|--------------|----------------|----------|
| `useCashBalanceData.ts` | `pos_total` (7.168,70 €) | ordersmart + wolt | **265,88 € ✓** |
| `DailySummary.tsx` | `kellnerUmsatz` (6.684,50 €) | ordersmart + wolt + takeaway | **-700,52 € ✗** |

**Das Problem:** 
- `kellnerUmsatz` ist die Summe der Kellner-POS-Umsätze (**ohne** Takeaway)
- `pos_total` ist der Vectron-Gesamtumsatz (**mit** Takeaway)
- Wenn man `kellnerUmsatz` verwendet und dann nochmals Takeaway abzieht, wird falsch gerechnet

### Korrekte Formel (wie in `useCashBalanceData.ts`)

```text
BARGELD = pos_total (Tagesumsatz)
        + vouchers_sold (Gutschein Verkauf)
        - terminal_1_total (Kreditkarten 1)
        - terminal_2_total (Kreditkarten 2)
        - ordersmart_revenue
        - wolt_revenue
        - vouchers_redeemed (Gutschein Eingelöst)
        - finedine_vouchers
        - einladung
        - open_invoices (Offene Rechnungen)
        - vorschuss
        - expenses (Ausgaben)
```

**Hinweis:** `takeaway_total` wird **NICHT** separat abgezogen, da es bereits im `pos_total` enthalten ist und über die Kellner-Kartenzahlungen bzw. als Barzahlung erfasst wird.

### Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/pages/DailySummary.tsx` | Formel korrigieren |
| `src/pages/ManagerDashboard.tsx` | Formel korrigieren (zwei Stellen: `bargeldPreview` und `previousDayBargeld`) |

---

### Technische Umsetzung

#### 1. DailySummary.tsx (Zeilen 71-89)

**Aktuell (falsch):**
```typescript
const bargeld = session
  ? kellnerUmsatz +                    // ❌ Summe der Kellner-pos_sales
    (session.vouchers_sold || 0) +
    (session.sonstige_einnahme || 0) -
    (session.terminal_1_total || 0) -
    (session.terminal_2_total || 0) -
    (session.vouchers_redeemed || 0) -
    (session.vorschuss || 0) -
    (session.einladung || 0) -
    totalOpenInvoices -
    totalExpenses +
    totalHilfMahl -                    // ❌ Hilf Mahl separat
    totalDeliveryRevenue -             // ❌ Delivery wird abgezogen
    (session.finedine_vouchers || 0)
  : 0;
```

**Neu (korrekt):**
```typescript
const bargeld = session
  ? (session.pos_total || 0) +         // ✓ Vectron-Gesamtumsatz
    (session.vouchers_sold || 0) -
    (session.terminal_1_total || 0) -
    (session.terminal_2_total || 0) -
    (session.ordersmart_revenue || 0) -
    (session.wolt_revenue || 0) -
    (session.vouchers_redeemed || 0) -
    (session.finedine_vouchers || 0) -
    (session.einladung || 0) -
    totalOpenInvoices -
    (session.vorschuss || 0) -
    totalExpenses
  : 0;
```

#### 2. ManagerDashboard.tsx - bargeldPreview (Zeilen 228-243)

**Aktuell:**
```typescript
const bargeldPreview = 
  kellnerUmsatz +
  formData.vouchers_sold +
  formData.sonstige_einnahme -
  formData.terminal_1_total -
  formData.terminal_2_total -
  formData.vouchers_redeemed -
  formData.vorschuss -
  formData.einladung -
  totalOpenInvoices -
  totalExpenses +
  totalHilfMahl -
  totalDeliveryRevenue -
  formData.finedine_vouchers;
```

**Neu:**
```typescript
const bargeldPreview = 
  formData.pos_total +
  formData.vouchers_sold -
  formData.terminal_1_total -
  formData.terminal_2_total -
  formData.ordersmart_revenue -
  formData.wolt_revenue -
  formData.vouchers_redeemed -
  formData.finedine_vouchers -
  formData.einladung -
  totalOpenInvoices -
  formData.vorschuss -
  totalExpenses;
```

#### 3. ManagerDashboard.tsx - previousDayBargeld (Zeilen 261-286)

Gleiche Korrektur für die Vortages-Berechnung.

---

### Auswirkung der Korrektur

**Beispiel 07.02.2026:**

| Berechnung | Vorher | Nachher |
|------------|--------|---------|
| BARGELD | -700,52 € ❌ | **265,88 €** ✓ |

---

### Was entfernt wird

- `sonstige_einnahme` - wird nicht mehr separat addiert (bereits in pos_total)
- `totalHilfMahl` - wird nicht mehr separat addiert (bereits in pos_total)
- `takeaway_total` - wird nicht mehr abgezogen (ist Umsatz, kein Bargeld-Abfluss)
- `totalDeliveryRevenue` als Sammelabzug - stattdessen einzeln ordersmart + wolt

---

### Zusammenfassung

Die Korrektur verwendet die gleiche bewährte Formel wie `useCashBalanceData.ts`, die korrekt ist. Die drei Änderungen stellen sicher, dass BARGELD konsistent in der gesamten App berechnet wird.
