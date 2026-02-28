

## Plan: Takeaway-Prozent-Formel für YUM anpassen

### Anforderung
Für YUM soll die Formel `(takeaway_total + ordersmart_revenue) / pos_total * 100` verwendet werden — also ohne Wolt.

### Aktuelle Logik
In `ExcelLayout.tsx` wird bei `ordersmartInTakeaway === false` (YUM) derzeit `(takeaway + ordersmart + wolt) / pos * 100` gerechnet.

### Umsetzung

**Datei: `src/components/daily-summary/layouts/ExcelLayout.tsx`**
- Die Formel im `else`-Zweig (wenn `ordersmartInTakeaway === false`, also YUM) ändern von:
  ```
  (takeaway_total + ordersmart_revenue + wolt_revenue) / pos_total * 100
  ```
  zu:
  ```
  (takeaway_total + ordersmart_revenue) / pos_total * 100
  ```

Eine Änderung an einer Stelle, eine Datei.

