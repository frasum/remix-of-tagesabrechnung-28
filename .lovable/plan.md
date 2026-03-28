
Problem

Ich habe die Daten geprüft: Für Appel (Perso 117, Küche) sind in der ausgewählten März-Periode tatsächlich 14 Schichten im YUM und 2 in der Spicery vorhanden. Die korrekte kumulierte Anzeige bei „Alle“ ist also 16 Schichten.

Was ich im Code gefunden habe

- Die Rohdaten sind korrekt.
- `payroll-office-data` dedupliziert Mitarbeiter serverseitig bereits nach `id + department`.
- `PayrollPortal.tsx` dedupliziert zusätzlich bei `effectiveRestaurant === "all"` nochmals nach `id + department`.

Das heißt: Der Fehler liegt sehr wahrscheinlich nicht mehr in der Datenmenge selbst, sondern darin, dass die Portal-Ansicht noch an mehreren Stellen eigene Mitarbeiter-/Schicht-Scoping-Logik benutzt. Dabei bleibt auf dem deduplizierten Mitarbeiterobjekt trotzdem noch ein einzelnes `restaurant_id` hängen, und genau diese Rest-Logik kann die Anzeige wieder in restaurantweise Zeilen aufspalten oder inkonsistent machen.

Plan

1. In `src/pages/shared/PayrollPortal.tsx` eine einzige kanonische Merge-Schicht einführen
- Direkt nach dem Laden der Daten eine zentrale `mergedEmployees`-Liste bauen, immer per Key `employee.id + department`.
- Bei „Alle“ darf diese Liste genau eine Zeile pro Mitarbeiter/Abteilung enthalten.
- Nicht mehr darauf vertrauen, dass mehrere spätere Filter dieselbe Deduplizierung zufällig korrekt reproduzieren.

2. Restaurant-Scoping zentralisieren
- Eine gemeinsame Helper-Funktion für Schichten einführen:
  - bei Einzelauswahl: nur Schichten aus dem gewählten Restaurant
  - bei „Alle“: alle Schichten für `employee_id + department`
- Diese eine Funktion dann überall verwenden:
  - `employeesWithShifts`
  - Zusammenfassung
  - Buchhaltung
  - Wochenwerte pro Woche
  - Gesamtsummen

3. `restaurant_id` nicht mehr als versteckte Entscheidungsgrundlage für die „Alle“-Zeile verwenden
- In der All-Ansicht darf ein gemergter Mitarbeiter nicht implizit an genau ein Restaurant „gebunden“ bleiben.
- Falls ein Badge/Text nötig ist, aus den tatsächlich vorhandenen Schichten bzw. Restaurantnamen ableiten, nicht aus dem zuerst gefundenen Datensatz.

4. Zusammenfassung und Buchhaltung auf dieselbe Quelle umstellen
- Beide Tabs müssen dieselbe `mergedEmployees`-Liste und dieselbe Shift-Scoping-Funktion nutzen.
- So ist ausgeschlossen, dass Appel in einer Ansicht 1 Zeile und in der anderen 2 Zeilen bekommt.

5. Exporte an dieselbe Logik hängen
- PDF/Excel/CSV ebenfalls auf die gleiche konsolidierte Mitarbeiterliste und dieselbe Shift-Quelle umstellen.
- Damit UI und Export dieselben 16 Schichten zeigen.

Technische Details

Betroffene Datei:
- `src/pages/shared/PayrollPortal.tsx`

Optional nur als Absicherung:
- `supabase/functions/payroll-office-data/index.ts` nur dann anfassen, wenn beim Test sichtbar wird, dass dort doch wieder doppelte Mitarbeiterobjekte zurückkommen. Nach meinem aktuellen Code-Check ist der Haupthebel aber jetzt die Vereinheitlichung im Frontend.

Erwartetes Ergebnis nach dem Fix

Für die März-Periode:
- Spicery: Appel = 2 Schichten
- YUM: Appel = 14 Schichten
- Alle: Appel = 1 Zeile mit 16 Schichten

Und zwar konsistent in:
- Lohnbüro Zusammenfassung
- Lohnbüro Buchhaltung
- Exporten
