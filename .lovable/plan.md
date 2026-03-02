

## Bug: Falsche Trinkgeld-Berechnung in Statistiken

### Ursache

In `src/hooks/useStatistics.ts` (Zeile ~219) wird für die Pool-Berechnung `kassiert_brutto` verwendet:
```
const expected = (shift.kassiert_brutto || 0) + (shift.hilf_mahl || 0) - ...
```

Die korrekte Formel in `WaiterCashUp.tsx` (Zeile 202-203) verwendet jedoch `pos_sales`:
```
const expected = (shift.pos_sales || 0) + (shift.hilf_mahl || 0) - ...
```

`kassiert_brutto` und `pos_sales` sind unterschiedliche Felder — dadurch wird der erwartete Bargeldbetrag falsch berechnet und der resultierende Trinkgeld-Pool-Anteil stimmt nicht.

### Fix in `src/hooks/useStatistics.ts`

Zeile ~219: `shift.kassiert_brutto` durch `shift.pos_sales` ersetzen, damit die Formel mit der Abrechnung übereinstimmt.

