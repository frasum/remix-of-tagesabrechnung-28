

## Plan: Perioden-Dropdown im SFN-Bereich

### Änderung

**Datei: `src/pages/zeiterfassung/ZtBruttoNetto.tsx`**

Die zwei Datumsfelder "Von" / "Bis" werden durch ein Perioden-Dropdown ersetzt, das alle verfügbaren Perioden aus `useZt()` auflistet. Die aktuelle Periode (`selectedPeriodId`) ist vorausgewählt. Bei Auswahl einer Periode werden `dateFrom`/`dateTo` automatisch gesetzt.

### Umsetzung

1. Neuen lokalen State `localPeriodId` hinzufügen, initialisiert mit `selectedPeriodId`.
2. Ein `Select`-Dropdown oberhalb der Datumsfelder einfügen mit allen `periods` als Optionen (Label: z.B. "26.01.2026 – 25.02.2026" oder der Periodenname falls vorhanden).
3. Bei `onValueChange` des Dropdowns: `localPeriodId` setzen und `dateFrom`/`dateTo` aus der gewählten Periode ableiten.
4. Die bestehenden Datumsfelder bleiben als read-only Anzeige oder werden komplett entfernt (da die Periode den Zeitraum definiert).
5. Der bestehende `useEffect` für `selectedPeriodId` wird durch die Initialisierung des `localPeriodId` ersetzt.

### Ergebnis
- Dropdown zeigt alle Perioden, Standard ist die aktuelle
- Datumswerte werden automatisch aus der gewählten Periode abgeleitet
- Keine Datenbankänderungen nötig

