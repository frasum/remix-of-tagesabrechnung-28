
## Plan: Doppeleinträge in der Batch-Brutto-Netto-Berechnung beseitigen

## Ursache
Der Fehler sitzt sehr wahrscheinlich in `src/components/zeiterfassung/BatchPayrollCalculation.tsx`:

1. `staff_restaurants` liefert **eine Zeile pro Zuordnung**  
   → also z.B. COCO einmal für Service und einmal für Küche.

2. Die Schichten werden aktuell nur nach `employee_id` gruppiert  
   → dadurch bekommt **jede Zuordnungszeile dieselben Gesamtstunden** des Mitarbeiters.

Das führt zu doppelten Einträgen mit identischen Stunden/Beträgen, obwohl es eigentlich nur **eine Berechnung pro Mitarbeiter und Restaurant** geben sollte.

## Umsetzung

### 1. Berechnungsbasis deduplizieren
In `BatchPayrollCalculation.tsx` die geladenen `staff_restaurants`-Daten nicht 1:1 in `calcList` übernehmen, sondern vorher nach diesem Schlüssel zusammenfassen:

```text
restaurant_id + staff_id
```

Damit gibt es pro Restaurant und Mitarbeiter nur noch **einen** Batch-Eintrag.

### 2. Abteilungen zusammenführen
Wenn derselbe Mitarbeiter im selben Restaurant mehreren Abteilungen zugeordnet ist, werden die Abteilungen gesammelt und zusammen angezeigt, z.B.:

```text
Service, Küche
```

So bleibt sichtbar, warum es mehrere Zuordnungen gibt, aber ohne doppelte Ergebniszeilen.

### 3. Schichten korrekt dem Restaurant zuordnen
Zusätzlich die Batch-Logik so anpassen, dass Schichten nicht nur nach `employee_id`, sondern nach:

```text
employee_id + restaurant_id
```

gruppiert werden.

Dafür wird `zt_shifts.week_id` über `weeks -> scheduling_periods` dem richtigen Restaurant zugeordnet. Sonst würden bei Mitarbeitern mit Einsätzen an mehreren Standorten dieselben Stunden fälschlich mehrfach verwendet.

### 4. Stundenlohn sauber bestimmen
Falls ein Mitarbeiter mehrere Zuordnungen im selben Restaurant hat, bleibt pro Mitarbeiter/Restaurant genau ein Stundenlohn übrig:
- bevorzugt `staff_restaurants.zt_hourly_rate`
- fallback `staff.hourly_rate`

Wenn mehrere Zuordnungen unterschiedliche `zt_hourly_rate` haben, nehme ich konsistent den definierten Wert nach einer klaren Regel (z.B. erster gültiger oder höchster gültiger Wert), damit keine Zufallswerte entstehen.

### 5. Tabellen-Rendering stabilisieren
Die Ergebnisliste bekommt danach automatisch eindeutige Zeilen je Mitarbeiter/Restaurant.  
Zusätzlich passe ich den Row-Key an die neue deduplizierte Struktur an, damit es keine React-Key-Kollisionen mehr gibt.

## Betroffene Datei
- `src/components/zeiterfassung/BatchPayrollCalculation.tsx`

## Ergebnis
Nach dem Fix gilt:
- ein Mitarbeiter erscheint pro Restaurant nur noch **einmal**
- mehrere Abteilungen werden nur noch als Sammeltext angezeigt
- Stunden und Beträge werden nicht mehr identisch dupliziert
- falls jemand wirklich in **zwei Restaurants** gearbeitet hat, erscheinen **zwei getrennte Zeilen mit jeweils eigenen Stunden**

## Technische Kurzform

```text
staff_restaurants
→ dedupe by (restaurant_id, staff_id)
→ merge departments

zt_shifts
→ resolve week_id -> period -> restaurant_id
→ group by (employee_id, restaurant_id)

batch result
→ one row per (restaurant_id, staff_id)
```
