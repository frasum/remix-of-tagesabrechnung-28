

## Plan: „Erstellt von" auf „Mo" ändern

Die heutige Tagesabrechnung (4. März 2026) zeigt aktuell **„Erstellt von: CHEFIN"**. Der Eintrag soll auf **„Mo"** geändert werden.

### Änderung

Eine einmalige Datenbank-Aktualisierung der Session (ID `95841ad2-...`):

```sql
UPDATE sessions
SET created_by_name = 'Mo', updated_by_name = 'Mo'
WHERE id = '95841ad2-a6f2-4356-bc75-a1c6bcaf3ad5';
```

Keine Code-Änderungen nötig — reine Datenkorrektur.

