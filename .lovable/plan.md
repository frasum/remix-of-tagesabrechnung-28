

## Zeitfenster-basierte Filterung fur den Kassenbestand

### Problem
`useCashBalanceData` ladt alle Sessions seit Beginn. Das Deficit-Chaining (negative Tageswerte werden auf Folgetage ubertragen) erfordert aber historische Daten fur korrekte Berechnungen.

### Losung: Zwei-Phasen-Ansatz

**Phase 1 -- DB-Funktion** fur die Vorab-Berechnung des CarryOvers vor dem Zeitfenster:
- Neue Datenbank-Funktion `compute_carry_over(p_restaurant_id, p_before_date)` die in SQL die Tag-fur-Tag-Simulation durchfuhrt und den letzten CarryOver-Wert zuruckgibt
- Dadurch muss der Client nur noch die detaillierten Sessions innerhalb des Zeitfensters laden

**Phase 2 -- Hook-Anpassung** in `useCashBalanceData`:
- Neuer optionaler Parameter `fromDate?: string` (Standard: 6 Monate zuruck)
- Sessions-Query bekommt `.gte('session_date', fromDate)` Filter
- Transfers-Query ebenso gefiltert
- CarryOver-Startwert kommt aus der DB-Funktion statt aus `initialDeficit`
- QueryKey enthalt `fromDate` fur korrekte Cache-Trennung

**Phase 3 -- Consumer-Anpassungen**:
- `CashBalance.tsx`: Berechnet `fromDate` als 6 Monate vor dem altesten verfugbaren Monat (oder heutigem Datum). Keine UI-Anderung notig, da die Monatsauswahl nur geladene Daten zeigt
- `History.tsx`: Ubergibt ebenfalls ein 6-Monats-Fenster
- `useRemainingCash.ts` und `usePreviousDayDeficit.ts`: Brauchen nur Daten bis zum aktuellen Datum -- das 6-Monats-Fenster reicht vollig

### Betroffene Dateien

| Datei | Anderung |
|---|---|
| **Migration (SQL)** | Neue Funktion `compute_carry_over` |
| `src/hooks/useCashBalanceData.ts` | `fromDate`-Parameter, DB-Funktionsaufruf, gefilterte Queries |
| `src/pages/CashBalance.tsx` | `fromDate` berechnen und ubergeben |
| `src/pages/History.tsx` | `fromDate` ubergeben |
| `src/hooks/useRemainingCash.ts` | Keine Anderung notig (nutzt selben Cache) |
| `src/hooks/usePreviousDayDeficit.ts` | Keine Anderung notig |

### DB-Funktion (Konzept)

```sql
CREATE OR REPLACE FUNCTION compute_carry_over(
  p_restaurant_id uuid,
  p_before_date date
) RETURNS numeric AS $$
  -- Iteriert uber alle Sessions vor p_before_date
  -- Berechnet rawBargeld + transferEffect pro Tag
  -- Tracked carryOver (negative bargeld-Werte)
  -- Gibt den letzten carryOver-Wert zuruck
$$
```

### Skalierungseffekt

- Vorher: ~730 Sessions/Jahr x alle Jahre = unbegrenzt wachsend
- Nachher: max ~180 Sessions (6 Monate) + 1 leichtgewichtiger DB-Funktionsaufruf
- Die DB-Funktion lauft serverseitig und ist auch bei tausenden Sessions schnell

