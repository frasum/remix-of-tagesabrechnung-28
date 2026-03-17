

## Datenbankarchitektur-Optimierung für Skalierbarkeit

### Analyse

Die aktuelle Architektur funktioniert gut für den jetzigen Umfang (2 Restaurants, ~2.000 Zeilen in der größten Tabelle). Bei Wachstum auf 5-10 Restaurants über mehrere Jahre gibt es jedoch konkrete Engpässe.

### Plan

#### 1. Fehlende Indexes hinzufügen (Migration)

```sql
-- zt_shifts: häufigste Abfrage ist .in("week_id", [...])
CREATE INDEX idx_zt_shifts_week ON zt_shifts (week_id);

-- zt_shifts: AI-Chat filtert nach shift_date Bereich
CREATE INDEX idx_zt_shifts_date ON zt_shifts (shift_date);

-- sessions: Abfragen ohne restaurant_id (AI-Chat cross-restaurant)
CREATE INDEX idx_sessions_date ON sessions (session_date);

-- kitchen_shifts: staff_id basierte Lookups (Sync, Zeiterfassung)
CREATE INDEX idx_kitchen_shifts_staff ON kitchen_shifts (staff_id);

-- waiter_shifts: staff_id basierte Lookups
CREATE INDEX idx_waiter_shifts_staff ON waiter_shifts (staff_id);
```

#### 2. Cleanup-Strategie für wachsende Log-Tabellen

Eine SQL-Funktion + pg_cron Job der regelmäßig alte Einträge löscht:
- `login_confirmations`: Einträge älter als 7 Tage löschen
- `auth_attempts`: Einträge älter als 90 Tage löschen
- `audit_logs`: Optional auf 12 Monate begrenzen

#### 3. AI-Chat: Serverseitige Aggregation vorbereiten

Statt 6 Monate Rohdaten zu laden, eine **materialized view** erstellen die tägliche/monatliche Zusammenfassungen vorhält:

```sql
CREATE MATERIALIZED VIEW mv_daily_summary AS
SELECT 
  s.restaurant_id, s.session_date,
  s.pos_total, s.guest_count,
  s.terminal_1_total + s.terminal_2_total as card_total,
  s.ordersmart_revenue, s.wolt_revenue,
  COUNT(ws.id) as waiter_count,
  SUM(ws.hours_worked) as total_waiter_hours,
  COALESCE(SUM(e.amount), 0) as total_expenses
FROM sessions s
LEFT JOIN waiter_shifts ws ON ws.session_id = s.id
LEFT JOIN expenses e ON e.session_id = s.id
GROUP BY s.id;

CREATE UNIQUE INDEX ON mv_daily_summary (restaurant_id, session_date);
```

Refresh per pg_cron (täglich nachts). Der AI-Chat liest dann aus der View statt 6+ Tabellen zu joinen.

### Technische Details

- **Keine Code-Änderungen nötig** für die Indexes — bestehende Queries profitieren automatisch
- Die materialized view erfordert Anpassungen in `restaurant-chat/index.ts` um daraus zu lesen
- Cleanup-Job als pg_cron Funktion, kein Edge Function nötig
- Alle Änderungen sind rückwärtskompatibel

### Priorität

1. **Indexes** (sofort, null Risiko, größter Impact)
2. **Log-Cleanup** (mittelfristig, verhindert DB-Bloat)
3. **Materialized View** (wenn AI-Chat bei >1.000 Sessions langsam wird)

