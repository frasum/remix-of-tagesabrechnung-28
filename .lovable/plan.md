

# Zweit-Kellner in der Provisionsberechnung berücksichtigen

## Problem
"Andi + Tu" ist als eine Schicht erfasst, wobei Tu als `second_waiter_name` oder in `additional_waiters` gespeichert ist. Die aktuelle Provisionsberechnung zählt nur den Hauptkellner (`waiter_name`) — Tu wird nicht als eigenständiger Service-MA gezählt. Daher zeigt der 26.02. nur 3 statt 4 Service-MA.

## Lösung
Die Query um `second_waiter_name` und `additional_waiters` erweitern. Beim Zählen der Service-MA pro Tag werden Zweit-/Zusatzkellner als separate Personen mitgezählt.

### Auswirkungen auf die Berechnung
- **Service-MA pro Tag**: Zweit-/Zusatzkellner werden als eigene MA gezählt → `staffDays` steigt → Ø Umsatz/Tag/MA sinkt
- **Stundenverteilung**: Die `hours_worked` der Schicht gehören zum Hauptkellner. Zweit-Kellner haben in der aktuellen Datenstruktur keine separaten Stunden, daher werden sie beim Stunden-Count nicht mitgezählt (nur beim MA-Count pro Tag)

### Technische Änderungen (nur `ZtProvision.tsx`)
1. Query erweitern: `second_waiter_name` und `additional_waiters` mit laden
2. `sessionCount` / `staffDays` Berechnung: auch `second_waiter_name` und jeden Eintrag aus `additional_waiters` als eigenen MA pro Tag zählen (sofern nicht GL)
3. `dailyBreakdown`: gleiches Prinzip — staffCount inkl. Zweit-/Zusatzkellner
4. Aggregation (`aggregated`): Zweit-/Zusatzkellner erscheinen nicht als eigene Zeile in der Haupttabelle (haben keine separaten Stunden/Umsatz), aber werden im Ø-Umsatz-Nenner berücksichtigt

