

## POS-Differenz-Warnung: OrderSmart nicht doppelt abziehen

### Problem
Die POS-Differenz-Warnung zeigt faelschlicherweise -137,08 EUR an. Der Grund: OrderSmart-Umsaetze sind bereits im Takeaway-Betrag enthalten, werden aber in der Formel nochmal separat abgezogen.

### Beweis (18.02.2026, Spicery)
```text
Aktuelle Formel:  4.469,00 - 4.136,60 - 332,40 - 137,08 = -137,08  (FALSCH)
Korrigierte Formel: 4.469,00 - 4.136,60 - 332,40         =    0,00  (KORREKT)
```

### Aenderung
`- ordersmart_revenue` aus der POS-Differenz-Berechnung entfernen. Drei Stellen:

1. **src/pages/DailySummary.tsx** (Zeile 443)
   - Alt: `posMismatch - formData.takeaway_total - formData.ordersmart_revenue`
   - Neu: `posMismatch - formData.takeaway_total`

2. **src/pages/ManagerDashboard.tsx** (Zeile 274)
   - Alt: `posMismatch - formData.takeaway_total - formData.ordersmart_revenue`
   - Neu: `posMismatch - formData.takeaway_total`

3. **src/utils/pdfExport.ts** (Zeile 130)
   - Alt: `data.totals.posMismatch - (data.session.takeaway_total || 0) - (data.session.ordersmart_revenue || 0)`
   - Neu: `data.totals.posMismatch - (data.session.takeaway_total || 0)`

### Auswirkung
- Warnung erscheint nur noch bei echten Differenzen
- Kein Einfluss auf BARGELD-Berechnung (dort wird OrderSmart korrekt separat behandelt)
- Keine Datenbank-Aenderungen noetig

