

## Plan: "Vorwoche kopieren" ersetzen durch "Vormonat kopieren"

### Was sich ändert
Die Funktion kopiert statt der Vorwoche die **Schichten des Vormonats** (vorherige Abrechnungsperiode 26.–25.) in den aktuellen Monat. Jede Schicht wird dabei auf denselben Wochentag in der entsprechenden Woche der neuen Periode gemappt (z.B. 1. Montag der alten Periode → 1. Montag der neuen Periode).

### Datei: `src/components/dienstplan/DienstplanToolbar.tsx`

**Komplett-Umbau der Kopier-Logik:**

1. **Entfernen** der `getCurrentWeekDates()`-Funktion und aller Vorwochen-Queries
2. **Vormonat berechnen**: Aus dem aktuellen `month`/`year` den Vormonat ableiten und mit `getPeriodRange()` die Datumsbereiche für beide Perioden holen
3. **Queries anpassen**: `useShiftAssignments` für Vormonats-Periode und aktuelle Periode laden
4. **Mapping-Logik**: Jede Schicht aus dem Vormonat wird per Wochentag-Position (welcher Mo/Di/Mi etc. im Zeitraum) auf den entsprechenden Tag der neuen Periode gemappt. Konkret: Offset in Tagen vom Perioden-Start berechnen, denselben Offset in der neuen Periode anwenden
5. **Konflikt-Check** bleibt erhalten (cross-restaurant conflicts werden für die neue Periode geprüft)
6. **Button-Label**: "Vormonat kopieren"
7. **Toasts** anpassen ("Vormonat" statt "Vorwoche")

### Mapping-Ansatz
Da beide Perioden exakt 26.–25. umfassen (immer ~30/31 Tage), wird der Tag-Offset vom Perioden-Start beibehalten:
```
neuesDatum = aktuellerPeriodenStart + (alteDatum - alterPeriodenStart) in Tagen
```
Falls das neue Datum über das Perioden-Ende hinausgeht, wird die Schicht übersprungen.

