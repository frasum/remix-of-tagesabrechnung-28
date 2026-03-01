

## Mitarbeiter in ShiftTimeOverride ausblenden

### Ansatz
Ein Suchfeld/Filter oberhalb der Mitarbeiterlisten hinzufuegen, plus eine "Ausgeblendete"-Funktion, mit der bestimmte Mitarbeiter dauerhaft (per localStorage) ausgeblendet werden koennen.

### Umsetzung in `src/components/zeiterfassung/ShiftTimeOverride.tsx`

1. **Neuer State `hiddenIds`** als `Set<string>`, initialisiert aus `localStorage` (Key z.B. `zt-shift-override-hidden`). Aenderungen werden sofort in localStorage persistiert, sodass die Auswahl zwischen Sessions erhalten bleibt.

2. **Toggle-Button "Ausgeblendete anzeigen"** oberhalb der Sektionen, der einen `showHidden`-State steuert. Wenn aktiv, werden ausgeblendete Mitarbeiter grau/durchgestrichen angezeigt mit einem Auge-Icon zum Wiedereinblenden.

3. **Auge-Icon pro Mitarbeiter** (EyeOff-Icon von lucide-react) neben jedem Checkbox-Eintrag, mit dem einzelne Mitarbeiter ausgeblendet werden koennen.

4. **Filterung**: Alle drei Sektionen (Bestehende ueberschreiben, Mo-Fr, Mo-So) filtern ihre `uniqueEmployees`/`uniqueAllEmployees`/`uniqueDailyEmployees` Listen, sodass ausgeblendete IDs nicht angezeigt werden (ausser `showHidden` ist aktiv).

5. **Zusaetzlich ein Textfilter** (kleines Input-Feld) zum schnellen Suchen nach Namen, das alle drei Listen gleichzeitig filtert.

6. **Badge** neben dem Toggle-Button, das anzeigt wie viele Mitarbeiter aktuell ausgeblendet sind (z.B. "3 ausgeblendet").

### Keine DB-Aenderung noetig
Die Ausblende-Praeferenz wird rein clientseitig in localStorage gespeichert.

