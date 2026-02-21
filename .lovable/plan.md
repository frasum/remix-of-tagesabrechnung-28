

## Fix: Timezone-Bug in der Wechselgeldbestand-Berechnung

### Ursache

In `useRemainingCash.ts` wird das Datum so formatiert:

```typescript
const dateStr = selectedDate.toISOString().split('T')[0];
```

`toISOString()` konvertiert in **UTC-Zeit**. In der deutschen Zeitzone (CET, UTC+1) wird z.B. "21. Februar 00:00 Uhr" zu `"2026-02-20T23:00:00Z"` -- also zum **20. Februar**. Dadurch wird der aktuelle Tag aus der Berechnung ausgeschlossen, und der Wechselgeldbestand und die Abschoepfung stimmen nicht.

### Loesung

`toISOString().split('T')[0]` durch `format(date, 'yyyy-MM-dd')` von date-fns ersetzen. Diese Funktion respektiert die lokale Zeitzone.

### Betroffene Dateien

| Datei | Zeile | Aenderung |
|---|---|---|
| `src/hooks/useRemainingCash.ts` | 12 | `toISOString().split('T')[0]` durch `format(selectedDate, 'yyyy-MM-dd')` ersetzen |
| `src/utils/businessDate.ts` | 31, 32, 44, 45 | Gleiche Korrektur in `isBusinessToday` und `isSessionLocked` |
| `src/pages/TelegramSettings.tsx` | 47 | Gleiche Korrektur fuer Default-Datum |

### Technische Details

- Import `format` aus `date-fns` in den betroffenen Dateien hinzufuegen
- `format(date, 'yyyy-MM-dd')` gibt immer das Datum in der lokalen Zeitzone zurueck
- `useSession.ts` nutzt bereits korrekt `format(date, 'yyyy-MM-dd')` -- das ist das Referenzmuster
- Nach der Korrektur wird der 21. Februar korrekt einbezogen, was Wechselgeldbestand = 2.000 EUR und Abschoepfung = 400,86 EUR ergibt

