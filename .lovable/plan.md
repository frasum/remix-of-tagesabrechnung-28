

## Dienstplan auf Abrechnungsperioden umstellen (26. Vormonat – 25. aktueller Monat)

Aktuell zeigt der Dienstplan Kalender-Monate (1.–28./31.). Er soll stattdessen die Abrechnungsperiode verwenden: 26. des Vormonats bis 25. des aktuellen Monats. Die bestehende Funktion `getPeriodRange` aus `src/lib/periodUtils.ts` berechnet genau diesen Zeitraum bereits.

### Änderungen

**`src/components/dienstplan/MonthlyGrid.tsx`**
- Die Funktion `getDatesInMonth` ersetzen: Statt Kalender-Monatstage (1.–31.) werden die Tage vom 26. des Vormonats bis zum 25. des Monats generiert (via `getPeriodRange` oder inline-Berechnung mit einer Schleife von `start` bis `end`)
- Der `month`-Prop bleibt 0-indexiert, wird aber für `getPeriodRange` auf 1-indexiert umgerechnet (month + 1)
- Die Spaltenköpfe im Grid sollen den Monatswechsel visuell kennzeichnen: Tage die zum Vormonat gehören bekommen z.B. eine dezente Hintergrundfarbe oder der 1. des Monats wird mit einem visuellen Separator markiert

**`src/components/dienstplan/DienstplanToolbar.tsx`**
- Label anpassen: Statt nur "März 2026" → "26.02. – 25.03.2026" oder "März 2026 (26.02.–25.03.)" anzeigen, damit der Zeitraum klar erkennbar ist

**`src/pages/dienstplan/DienstplanKueche.tsx` & `DienstplanService.tsx`**
- Keine Änderung nötig — `month` und `year` werden weiterhin als Steuerung durchgereicht, die Interpretation ändert sich nur in `MonthlyGrid` und `DienstplanToolbar`

### Technische Details

- `getPeriodRange(month + 1, year)` liefert `{ start, end, label }` — `start` ist der 26. des Vormonats, `end` der 25. des aktuellen Monats
- Die Datumsliste wird durch eine Schleife von `start` bis `end` erzeugt (statt `getDatesInMonth`)
- Im Spaltenheader wird visuell markiert, welche Tage noch zum Vormonat gehören (leicht abgedunkter Hintergrund), damit die Orientierung im Grid erhalten bleibt

