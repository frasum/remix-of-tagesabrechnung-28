

## Peters YUM-Schichten → Spicery umordnen

### Ausgangslage
Peter (GL) hat **ca. 20 Schichten** im YUM für die Periode März 2026 (26.02.–25.03.2026), alle mit 17:00–01:00. In der Spicery existiert die gleiche Periode mit identischen Wochen-Nummern. Es gibt keine Konflikte (keine bestehenden Spicery-Schichten für Peter in diesem Zeitraum).

### Vorgehen

Da die `zt_shifts`-Tabelle einen UNIQUE-Constraint auf `employee_id, shift_date, department` hat, kann ich die `week_id` der bestehenden Schichten direkt auf die Spicery-Wochen ändern. Das ist ein reines Daten-Update — kein Code oder Schema muss geändert werden.

**Wochen-Mapping (YUM → Spicery):**

| Woche | YUM week_id | Spicery week_id |
|-------|-------------|-----------------|
| 1 | `1a41c986-...` | `944b58ee-...` |
| 2 | `ffc44363-...` | `4557444e-...` |
| 3 | `8b5c2120-...` | `73c6cced-...` |
| 4 | `361c1f1f-...` | `8a5ca6c4-...` |
| 5 | `bc3f93c0-...` | `d64786c0-...` |

**Aktion:** 5 UPDATE-Statements, je eines pro Woche, die Peters Schichten von der YUM-`week_id` auf die Spicery-`week_id` umsetzen. Die Schichtdaten (Zeiten, Stunden, Feiertag-Flags) bleiben unverändert.

```sql
-- Woche 1
UPDATE zt_shifts SET week_id = '944b58ee-...' 
WHERE employee_id = 'peter_id' AND week_id = '1a41c986-...';
-- ... analog für Wochen 2–5
```

Keine Code-Änderungen nötig. Reine Datenkorrektur.

