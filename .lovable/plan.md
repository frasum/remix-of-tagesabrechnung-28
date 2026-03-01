

## Paginierung für die Audit-Log-Liste

### Änderungen

**1. `src/hooks/useAuditLogs.ts` — `useAuditLogs` erweitern**
- Parameter `page` (default 0) hinzufügen, `PAGE_SIZE = 30`
- Query mit `{ count: 'exact' }` und `.range(page * 30, (page + 1) * 30 - 1)`
- Rückgabe: `{ logs, totalCount }` statt flachem Array
- QueryKey enthält `page`
- Filter `table_name = 'waiter_shifts'` in die DB-Query verschieben (statt client-seitig), damit die Paginierung korrekt zählt

**2. `src/components/audit/AuditLogList.tsx` — Paginierungs-UI**
- `page` State (default 0) hinzufügen
- `totalCount` aus Hook auslesen, `totalPages` berechnen
- Unter den Log-Einträgen Pagination-Komponenten (Vor/Zurück + Seitenzahlen) anzeigen
- Client-seitigen `waiterShiftLogs`-Filter entfernen (wird jetzt in DB gefiltert)

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| `src/hooks/useAuditLogs.ts` | `page`-Parameter, `count: 'exact'`, `.range()`, `.eq('table_name', 'waiter_shifts')` |
| `src/components/audit/AuditLogList.tsx` | Page-State, Pagination-UI, DB-Filter statt Client-Filter |

