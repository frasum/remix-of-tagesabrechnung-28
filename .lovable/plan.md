

## Vortags-Defizit automatisch uebertragen

Wenn der BARGELD-Betrag eines Tages negativ ist, soll dieses Defizit am naechsten Tag automatisch als Abzugsposten in der Sektion "Gutscheine & Sonstiges" erscheinen und in die BARGELD-Berechnung einfliessen. Das Ganze kettet sich: Ist auch Tag 2 negativ (inklusive Vortags-Defizit), wird das am Tag 3 uebertragen, usw.

### Wie es funktioniert

- **Montag**: BARGELD = -271,16 EUR
- **Dienstag**: In "Gutscheine & Sonstiges" erscheint eine neue Zeile "Fehlbetrag Vortag: -271,16 EUR". Dieser Betrag wird von der BARGELD-Berechnung abgezogen.
- Die Zeile erscheint **nur**, wenn der Vortag tatsaechlich negativ war.

### Technische Umsetzung

**1. Neuer Hook: Vortags-Bargeld laden**

In `src/pages/DailySummary.tsx` wird ein zusaetzlicher Query eingefuegt, der die Session des Vortages laedt und deren BARGELD berechnet. Da sich das Defizit verketten soll, muss rekursiv zurueckgeschaut werden: Alle Sessions vor dem aktuellen Datum laden, chronologisch das Bargeld berechnen, und den letzten negativen Uebertrag ermitteln.

Konkret: Eine neue Hilfsfunktion `usePreviousDayDeficit(date, restaurantId)` erstellen, die:
- Die Session des Vortages laedt (inkl. waiter_shifts, expenses, advances)
- Das BARGELD berechnet (gleiche Formel wie in DailySummary)
- Falls negativ, diesen Betrag als `previousDeficit` zurueckgibt
- Falls der Vortag selbst einen Vortags-Defizit hatte, diesen einrechnet (Verkettung)

**2. `src/hooks/usePreviousDayDeficit.ts` (neue Datei)**

```text
- Laedt alle Sessions bis zum Vortag des gewaehlten Datums
- Berechnet pro Tag das BARGELD (gleiche Logik wie useCashBalanceData)
- Berechnet den verketteten Uebertrag: Wenn Tag N negativ ist, wird das Defizit auf Tag N+1 addiert
- Gibt den Uebertrag fuer den aktuellen Tag zurueck (0 wenn Vortag positiv war)
```

**3. `src/pages/DailySummary.tsx` anpassen**

- Den neuen Hook einbinden: `const { data: previousDeficit = 0 } = usePreviousDayDeficit(selectedDate, restaurantId)`
- `previousDeficit` in die BARGELD-Berechnung einbeziehen (wird abgezogen)
- `previousDeficit` als neue Prop an `ExcelLayout` uebergeben

**4. `src/components/daily-summary/layouts/ExcelLayout.tsx` anpassen**

- Neue Prop `previousDeficit` (number, default 0)
- In der Sektion "Gutscheine & Sonstiges": Wenn `previousDeficit < 0`, eine neue `ExcelReadonlyRow` anzeigen mit Label "Fehlbetrag Vortag" und dem negativen Wert
- Der Wert ist bereits in der BARGELD-Berechnung enthalten (kommt ueber die `bargeld`-Prop)

### Ergebnis

- Negative Bargeld-Bestaende werden automatisch auf den Folgetag uebertragen
- Die Zeile "Fehlbetrag Vortag" erscheint nur bei tatsaechlichem Defizit
- Die Verkettung funktioniert ueber mehrere Tage hinweg
- Kein manueller Eingriff noetig
