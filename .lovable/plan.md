

## Analyse: Urlaub nur am 25.3. sichtbar

### Ursache

Die Funktion `handleAbsenceRange` in `ZtWochenplan.tsx` (Zeile 417–455) iteriert über alle Tage im gewählten Zeitraum und sucht für jeden Tag eine passende Woche in `effectiveWeeks`. Diese `effectiveWeeks` enthalten **nur die Wochen der aktuell ausgewählten Abrechnungsperiode**.

Eine Periode läuft typischerweise vom 26. eines Monats bis zum 25. des Folgemonats. Das bedeutet:

- **25.03.** gehört zur Periode **26.02.–25.03.** — wenn diese gerade ausgewählt ist, wird der Eintrag erstellt.
- **26.03.–25.04.** gehört zur **nächsten** Periode.
- **26.04.–03.05.** gehört zur **übernächsten** Periode.

Alle Tage, die nicht in einer Woche der aktuellen Periode liegen, werden **übersprungen** (`skipped++`). Es wurde vermutlich ein Toast angezeigt wie "39 Tag(e) lagen außerhalb der Periode", aber das ist leicht zu übersehen.

### Fix

Die Abwesenheits-Eintragung muss **periodenübergreifend** funktionieren:

1. **Alle Perioden laden**, die den Abwesenheitszeitraum abdecken (nicht nur die aktuell ausgewählte).
2. **Alle Wochen dieser Perioden** als Zielwochen verwenden.
3. Für jeden Tag die passende Woche aus dem erweiterten Wochen-Pool finden.
4. Im kumulierten Modus: `findWeekIdForEmployee` muss ebenfalls über alle relevanten Perioden suchen.

### Umsetzung in `ZtWochenplan.tsx`

**Datei:** `src/pages/zeiterfassung/ZtWochenplan.tsx`

- In `handleAbsenceRange`: Statt nur `effectiveWeeks` zu durchsuchen, alle Wochen aller Perioden laden, die den Abwesenheitszeitraum (startDate–endDate) abdecken.
- Dazu einen zusätzlichen Query einführen, der bei geöffnetem Abwesenheits-Dialog die passenden Perioden + Wochen lädt:

```text
User wählt Urlaub 25.03.–03.05.
  → Query: scheduling_periods WHERE start_date <= '2025-05-03' AND end_date >= '2025-03-25'
  → Ergebnis: Periode 26.02–25.03, Periode 26.03–25.04, Periode 26.04–25.05
  → Alle Wochen dieser 3 Perioden laden
  → Jeden Tag der richtigen Woche zuordnen und upserten
```

- Alternativ (einfacher): Eine Warnung im Dialog anzeigen, wenn der gewählte Zeitraum über die aktuelle Periode hinausgeht, und den User auffordern, die Eintragung periodenweise vorzunehmen. Das ist aber schlechtere UX.

### Empfehlung

Option 1 (periodenübergreifend) ist die bessere Lösung. Die Änderungen beschränken sich auf `handleAbsenceRange` plus einen kleinen Hilfs-Query.

