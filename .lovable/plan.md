

# Alle Schichten von GUNG zu NET übertragen

## Kontext
- **GUNG** (ID: `3b7de396-11a2-4511-a053-a5a57178acc1`) hat 9 Schichten in `zt_shifts`
- **NET** (ID: `ce9f799f-66c3-4497-ac35-9d20b171da5b`)

## Änderungen

### 1. Daten-Update (via Insert-Tool)
```sql
UPDATE zt_shifts 
SET employee_id = 'ce9f799f-66c3-4497-ac35-9d20b171da5b'
WHERE employee_id = '3b7de396-11a2-4511-a053-a5a57178acc1';
```

### 2. Zusätzlich prüfen
- `shift_assignments` — Dienstplan-Einträge von GUNG ebenfalls auf NET übertragen
- `kitchen_shifts` / `waiter_shifts` — falls dort Einträge mit GUNGs `staff_id` existieren

Alle Updates werden per Datenbank-Tool ausgeführt, kein Code-Änderung nötig.

