

# Fix: Appel fehlt bei Einzelrestaurant-Auswahl im Lohnportal

## Ursache

Die Edge-Function `payroll-office-data` (Zeile 318–324) dedupliziert Mitarbeiter nach `id + department` **ohne** `restaurant_id`. Dadurch kommt Appel nur **einmal** zurück — mit dem `restaurant_id` des zuerst gefundenen Eintrags (z.B. YUM). Wenn dann im Frontend Spicery ausgewählt wird, filtert Zeile 396 (`e.restaurant_id === effectiveRestaurant`) Appel heraus, weil sein einziger Eintrag `restaurant_id = YUM` hat.

Gleicher Fehler wie vorher, nur andersherum: Die serverseitige Deduplizierung ist zu aggressiv.

## Lösung

### 1. Edge-Function: `supabase/functions/payroll-office-data/index.ts`

Deduplizierung auf `id + department + restaurant_id` ändern (wie in `useCumulatedZtData.ts`):

```typescript
const key = `${row.staff.id}-${row.zt_department}-${row.restaurant_id}`;
```

So kommt Appel zweimal zurück: einmal mit YUM, einmal mit Spicery. Das Frontend kann dann korrekt filtern.

### 2. Frontend: `src/pages/shared/PayrollPortal.tsx`

Keine Änderung nötig — die bestehende Logik ist bereits korrekt:
- Bei Einzelrestaurant: `e.restaurant_id === effectiveRestaurant` filtert den richtigen Eintrag
- Bei "Alle": Dedup nach `id + department` konsolidiert zu einer Zeile

### Ergebnis
- Spicery: Appel = 1 Zeile mit 2 Schichten
- YUM: Appel = 1 Zeile mit 14 Schichten
- Alle: Appel = 1 Zeile mit 16 Schichten (kumuliert)

**1 Datei betroffen:** `supabase/functions/payroll-office-data/index.ts` (1 Zeile ändern)

