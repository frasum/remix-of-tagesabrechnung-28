

## Datenbankindizes fuer haeufig gefilterte Spalten

### Ist-Zustand

Die `sessions`-Tabelle hat bereits einen optimalen zusammengesetzten Unique-Index auf `(restaurant_id, session_date)` -- hier besteht kein Handlungsbedarf.

Allerdings fehlen Indizes auf den **Kind-Tabellen**, die bei fast jedem Seitenaufruf ueber `.in('session_id', sessionIds)` abgefragt werden. Das betrifft die Kassenuebersicht, Tagesabrechnung und Statistiken.

### Fehlende Indizes

| Tabelle | Spalte | Abfrage-Muster |
|---|---|---|
| `waiter_shifts` | `session_id` | Jede Tagesabrechnung, Statistik, Kassenuebersicht |
| `expenses` | `session_id` | Kassenuebersicht, Statistik |
| `advances` | `session_id` | Kassenuebersicht |
| `kitchen_shifts` | `session_id` | Statistik, Kuechentrinkgeld |
| `card_transactions` | `waiter_shift_id` | Kartenumsaetze pro Kellner |
| `bank_deposits` | `restaurant_id` | Kassenuebersicht |

### Aenderung

Eine einzelne Datenbank-Migration mit 6 `CREATE INDEX`-Anweisungen:

```sql
CREATE INDEX idx_waiter_shifts_session ON waiter_shifts (session_id);
CREATE INDEX idx_expenses_session ON expenses (session_id);
CREATE INDEX idx_advances_session ON advances (session_id);
CREATE INDEX idx_kitchen_shifts_session ON kitchen_shifts (session_id);
CREATE INDEX idx_card_transactions_shift ON card_transactions (waiter_shift_id);
CREATE INDEX idx_bank_deposits_restaurant ON bank_deposits (restaurant_id);
```

### Auswirkung

- Spuerbar schnellere Ladezeiten bei Kassenuebersicht, Tagesabrechnung und Statistiken
- Besonders relevant bei wachsender Datenmenge (viele Sessions/Schichten)
- Kein Code-Aenderung noetig, nur Datenbank-Schema

