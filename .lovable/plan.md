

## Realtime-Updates fuer Kellner-Abrechnungen

Wenn ein Kellner seine Abrechnung ueber den Selfservice einreicht oder aendert, soll die Manager-Ansicht (Kellner Abrechnung) automatisch aktualisiert werden -- ohne Neuladen.

### Aenderungen

**1. Datenbank: Realtime fuer `waiter_shifts` aktivieren**

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiter_shifts;
```

**2. `src/hooks/useSession.ts` -- `useWaiterShifts` erweitern**

Einen `useEffect` mit Realtime-Subscription in den bestehenden Hook einbauen:

- Supabase-Channel auf `waiter_shifts` abonnieren (gefiltert auf die aktuelle `session_id`)
- Bei jedem `INSERT`, `UPDATE` oder `DELETE` Event die React-Query-Daten per `queryClient.invalidateQueries` neu laden
- Channel beim Unmount aufraeumen (`supabase.removeChannel`)

Der Hook bleibt fuer alle Konsumenten (WaiterCashUp, WaiterMobile, DailySummary) gleich -- alle profitieren automatisch vom Realtime-Update.

### Ergebnis

- Manager sieht sofort, wenn ein Kellner seine Abrechnung einreicht oder aendert
- Kein manuelles Neuladen noetig
- Bestehende Funktionalitaet bleibt unveraendert

