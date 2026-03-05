

## Problem

"Tu" hat 0.0 Stunden, weil er in mindestens einigen Sessions als **zusätzlicher Mitarbeiter** (Team-Shift / `additional_waiters`) eingetragen ist. Die Logik auf Zeile 141-149 fügt für `additional_waiters` zwar Trinkgeld hinzu, aber **keine Stunden** — weil `additional_waiters` nur ein Name-Array ist, ohne eigene `hours_worked`.

Zusätzlich gibt es ein Key-Mismatch-Problem: Wenn "Tu" auch eigene primäre Schichten hat (mit `staff_id` als Key), werden die additional_waiter-Einträge (Key = `"tu"`) **nicht zusammengeführt** mit den primären Schichten (Key = UUID). So entstehen zwei separate Einträge — einer mit Stunden aber ohne TG aus Team-Shifts, und einer mit TG aber 0 Stunden.

## Lösung

1. **Additional Waiters mit Staff-Lookup verknüpfen**: Beim Verarbeiten der `additional_waiters` den Namen gegen die `staff`-Tabelle matchen, um die `staff_id` als Key zu verwenden (wie bei primären Schichten)
2. **Stunden für additional_waiters**: Da `additional_waiters` keine eigenen `hours_worked` haben, können keine Stunden zugeordnet werden — das ist korrekt. Aber die Einträge müssen in denselben Map-Eintrag wie die eigenen Schichten fließen, damit die Stunden aus den eigenen Schichten erhalten bleiben.

### Änderung in `src/hooks/useMonthlyStaffTips.ts`

Bei der Verarbeitung der `additional_waiters` (Zeilen 142-149):
- Den Staff-Namen gegen die bereits geladene `staffResult.data` Liste matchen, um eine `staff_id` zu finden
- Falls gefunden → `staff_id` als Key verwenden (konsistent mit primären Schichten)
- Falls nicht → Fallback auf `name.toLowerCase().trim()` (wie bisher)

```text
Vorher:
  primary shift "Tu" → key = staff_id (UUID)  → { hours: 5, tip: 20 }
  additional_waiter "Tu" → key = "tu"          → { hours: 0, tip: 15 }  ← separater Eintrag!

Nachher:
  primary shift "Tu" → key = staff_id (UUID)  → { hours: 5, tip: 20 }
  additional_waiter "Tu" → key = staff_id (UUID) → selber Eintrag → { hours: 5, tip: 35 }
```

