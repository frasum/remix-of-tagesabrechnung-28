

## Trinkgeld pro Stunde Kachel hinzufügen

### Was wird gemacht
Eine vierte StatCard "TG / Stunde" wird in der Trinkgeld-Pool-Sektion auf der WaiterCashUp-Seite hinzugefügt. Sie zeigt, wie viel Trinkgeld pro Arbeitsstunde die Pool-Mitarbeiter im Schnitt erhalten haben.

### Berechnung
- Gesamte Pool-Stunden = Summe aller `hours_worked` aus den `waiterShifts` (nur Pool-Teilnehmer, Team-Shifts anteilig)
- Trinkgeld pro Stunde = `totalPool / totalPoolHours`
- Wenn keine Stunden erfasst sind: "—" anzeigen

### Änderungen

**`src/pages/WaiterCashUp.tsx`**:
1. Import `Clock` Icon von lucide-react
2. Neue Variable `totalPoolHours` berechnen (analog zu `waiterShareCount`, nur Pool-Teilnehmer)
3. `tipPerHour` = `totalPoolHours > 0 ? totalPool / totalPoolHours : 0`
4. Grid von `grid-cols-2` auf `grid-cols-2` beibehalten, aber die `col-span-2`-Kachel "Pro Mitarbeiter" auf `col-span-1` ändern und die neue "TG / Stunde"-Kachel daneben setzen — so entsteht ein 2x2-Grid mit 4 gleich großen Kacheln
5. Neue StatCard: `label="TG / Stunde"`, `value` als formatierter String (z.B. "12,50 €/Std.") oder als Zahl, `icon=<Clock>`, `variant="success"`

