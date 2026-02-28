

## Plan: Arbeitszeiten der Kellner erfassen und übermitteln

Die Idee: Kellner starten ihre Schicht standardmäßig um 16:00 Uhr und beenden sie, wenn sie ihre Abrechnung einreichen (`submitted_at`). Diese Zeiten sollen in der `waiter_shifts`-Tabelle gespeichert und im Settlement-Webhook mitgeschickt werden.

### Technische Details

**1. Datenbank-Migration**
- Neue Spalten in `waiter_shifts`:
  - `shift_start` (time, default `'16:00'`)
  - `shift_end` (time, nullable) — wird beim Submit gesetzt
  - `hours_worked` (numeric, nullable) — berechnet aus Start/End

**2. Edge Function `send-settlement`**
- Bereits enthalten: `waiter_shifts` werden komplett übermittelt
- Durch die neuen Spalten werden `shift_start`, `shift_end`, `hours_worked` automatisch im Payload mitgeschickt — keine Code-Änderung nötig

**3. Frontend: Schicht-Ende beim Einreichen setzen**
- In `WaiterMobile.tsx` (`handleSave`): Beim Erstellen einer neuen Schicht `shift_start: '16:00'` mitgeben
- Beim Einreichen (wenn `submitted_at` gesetzt wird): `shift_end` auf aktuelle Uhrzeit setzen und `hours_worked` berechnen
- In `DailySummary.tsx` / Manager-View: Wenn der Manager die Schicht als eingereicht markiert, ebenfalls `shift_end` und `hours_worked` setzen

**4. Optional: Start-Zeit editierbar**
- Falls ein Kellner nicht um 16:00 angefangen hat, könnte die Startzeit im Formular anpassbar sein

### Umsetzungsschritte
1. Migration: 3 neue Spalten auf `waiter_shifts`
2. `WaiterMobile.tsx`: `shift_start` beim Erstellen setzen, `shift_end` + `hours_worked` beim Submit berechnen
3. Manager-Submit-Logik: gleiche Berechnung beim manuellen Einreichen
4. Keine Änderung an `send-settlement` nötig (Spalten werden automatisch mitgeliefert)

