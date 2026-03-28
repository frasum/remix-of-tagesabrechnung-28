
Problem gefunden: Der Fehler steckt sehr wahrscheinlich nicht mehr in `SharedZtView`, sondern im eigentlichen Lohnbüro-Portal `src/pages/shared/PayrollPortal.tsx` plus dessen Datenquelle `supabase/functions/payroll-office-data/index.ts`.

Was gerade schiefläuft:
1. Das Lohnbüro-Portal lädt seine Daten über `payroll-office-data`, nicht über `shared-zt-data`.
2. Diese Funktion dedupliziert Mitarbeiter aktuell nach `id + department + restaurant_id` statt nach `id + department`.
3. Dadurch kommen bei Auswahl `Alle` bewusst zwei Mitarbeiterobjekte zurück, wenn jemand in beiden Restaurants angelegt ist.
4. In `PayrollPortal.tsx` werden diese zwei Datensätze dann unverändert in `Zusammenfassung` und `Buchhaltung` gerendert.
5. Zusätzlich scopen `PayrollZusammenfassungTab` und `PayrollBuchhaltungTab` ihre Stunden noch mit `restaurant_id`, wodurch selbst eine UI-Deduplizierung die Werte nicht sauber kumulieren würde.

Warum du es noch doppelt siehst:
- In deinem Screenshot ist das exakt das Verhalten von `PayrollPortal`:
  - zwei Zeilen
  - gleiche Personalnummer 117
  - gleiche Abteilung Küche
  - einmal 14 Schichten, einmal 2 Schichten
- Das zeigt: die Daten werden restaurantweise getrennt geliefert und auch restaurantweise berechnet.

Umsetzungsvorschlag:
1. `supabase/functions/payroll-office-data/index.ts`
   - Für die Ansicht `Alle` Mitarbeiter serverseitig nach `id + department` zusammenführen.
   - Dabei genau einen kombinierten Datensatz pro Person/Abteilung zurückgeben.
   - Optional die Restaurant-Zuordnung als Zusatzinfo behalten (z. B. Liste oder Flag), aber nicht mehr als getrennte Zeilen.

2. `src/pages/shared/PayrollPortal.tsx`
   - `filteredEmployees` bei `effectiveRestaurant === "all"` explizit nach `id + department` deduplizieren.
   - `employeesWithShifts` darauf aufbauen, damit die Renderliste garantiert nur eine Zeile pro Person/Abteilung enthält.

3. `PayrollZusammenfassungTab`
   - Bei `Alle` die Funktionen `scopeShifts`, `getWeeklyHours` und `getEmpTotals` nicht mehr nach `restaurantId` einschränken.
   - Stattdessen alle Schichten derselben Person/Abteilung über alle Restaurant-Wochen kumulieren.

4. `PayrollBuchhaltungTab`
   - Gleiches Prinzip wie in der Zusammenfassung:
     - `scopeShiftsForEmp` darf bei `Alle` nicht pro Restaurant trennen
     - `grandTotals` und Zeilenberechnung müssen über alle Schichten der Person/Abteilung laufen
   - So entsteht eine einzige Zeile mit kumulierten Schichten und Stunden.

5. Exporte angleichen
   - PDF/Excel/CSV in `Zusammenfassung` und `Buchhaltung` ebenfalls auf dieselbe kumulierte Mitarbeiterliste und dieselben kumulierten Shift-Mengen umstellen, damit UI und Export identisch sind.

Betroffene Dateien:
- `supabase/functions/payroll-office-data/index.ts`
- `src/pages/shared/PayrollPortal.tsx`

Erwartetes Ergebnis nach dem Fix:
- Bei Auswahl `YUM`: 1 Zeile mit nur YUM-Werten
- Bei Auswahl `Spicery`: 1 Zeile mit nur Spicery-Werten
- Bei Auswahl `Alle`: 1 Zeile mit Summe aus beiden Restaurants
- Das gilt dann sowohl für `Zusammenfassung` als auch `Buchhaltung` im Lohnbüro-Portal

Technischer Kern:
```text
Aktuell:
employee key = id + department + restaurant_id
=> 2 Zeilen

Soll:
employee key = id + department
=> 1 Zeile

Aktuell bei "Alle":
totals = nur Schichten des employee.restaurant_id
=> getrennte Werte

Soll bei "Alle":
totals = alle Schichten des employee_id + department
=> kumulierte Werte
```

Kurz gesagt: Das Problem ist eine zweite, separate Implementierung im Lohnbüro-Portal. Die bisherigen Fixes an anderen Stellen greifen dort nicht vollständig, weil dort eigene Datenbeschaffung und eigene Aggregationslogik existieren.
