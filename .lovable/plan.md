

# Fix: Fehlerhafte Umlaute in der nationality-Spalte korrigieren

## Problem
Zwei Einträge in der `nationality`-Spalte haben kaputte Umlaute (Mojibake):
- `225 - �thiopisch` → soll `225 - äthiopisch` sein
- `476 - thail�ndisch` → soll `476 - thailändisch` sein

## Lösung
Eine Daten-Migration (via Insert-Tool / UPDATE) die diese zwei Werte korrigiert:

```sql
UPDATE staff SET nationality = '225 - äthiopisch' WHERE nationality = '225 - Äthiopisch' OR nationality LIKE '225 - _thiopisch' OR nationality LIKE '225 -%thiopisch';
UPDATE staff SET nationality = '476 - thailändisch' WHERE nationality LIKE '476 - thail_ndisch' AND nationality != '476 - thailändisch';
```

Zwei UPDATE-Statements, keine Schemaänderung nötig. Wird über das Insert-Tool ausgeführt.

