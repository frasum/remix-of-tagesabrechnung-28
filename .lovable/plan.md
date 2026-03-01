

## Lohnbuero Sharing-Link: Restaurant-Auswahl

Der Sharing-Link (`/zt/:token`) zeigt aktuell nur die Daten des einen Restaurants, fuer das der Token erstellt wurde. Das Lohnbuero soll aber — genau wie im Lohnbuero-Portal — zwischen den einzelnen Restaurants und einer kumulierten Ansicht ("Alle") wechseln koennen.

### Ansatz

Die Edge Function `shared-zt-data` wird erweitert, um beim GET-Request auch alle anderen Perioden mit identischem Datumsbereich zu finden (die ebenfalls einen `share_token` haben). Die zusaetzlichen Restaurant-Daten werden mit zurueckgegeben, sodass das Frontend client-seitig filtern kann.

### Aenderungen

| Datei | Aenderung |
|---|---|
| `supabase/functions/shared-zt-data/index.ts` | **GET-Response erweitern**: Neben den Daten der Token-Periode auch alle anderen `scheduling_periods` mit gleichem `start_date`/`end_date` und vorhandenem `share_token` laden. Mitarbeiter, Schichten, Wochen, Notizen und Vorschuesse aller passenden Perioden zusammenfuehren. Restaurant-Namen und IDs in der Response mitsenden (`matchingPeriods`, `weekNumberToAllIds`). Die bisherige einzelne Periode bleibt als "Anker" erhalten. |
| `src/pages/shared/SharedZtView.tsx` | **Restaurant-Filter UI hinzufuegen**: Oben im Header Buttons fuer jedes Restaurant + "Alle" anzeigen (aehnlich dem `cumulated`-Toggle in ZtBuchhaltung). Client-seitig Schichten und Mitarbeiter nach `restaurant_id` filtern. Bei "Alle" werden alle Daten kumuliert angezeigt (Mitarbeiter nach ID+Department dedupliziert, Stunden summiert). Die Wochen-Deduplizierung und `weekNumberToAllIds`-Logik wird analog zum PayrollPortal uebernommen. |

### Technische Details

**Edge Function** (shared-zt-data GET):
- Nach Token-Validierung: zusaetzlich `scheduling_periods` mit `start_date = period.start_date AND end_date = period.end_date AND share_token IS NOT NULL` laden
- Alle Period-IDs sammeln, Wochen/Schichten/Notizen/Vorschuesse fuer alle laden
- Mitarbeiter aus allen beteiligten Restaurants laden (mit `restaurant_id` je Eintrag)
- Wochen nach `week_number` deduplizieren, `weekNumberToAllIds` Map mitgeben
- `matchingPeriods` Array mit `{ id, restaurant_id, restaurant_name }` zurueckgeben
- Jede Woche bekommt eine `restaurant_id` (aus der zugehoerigen Periode), damit client-seitig gefiltert werden kann

**Frontend** (SharedZtView):
- Neuer State `selectedRestaurant: string | 'all'` (Default: Restaurant-ID der Token-Periode)
- Filter-Buttons im Header wenn `matchingPeriods.length > 1`
- Schichten werden nach `week_id` → Restaurant gefiltert
- Mitarbeiter werden nach Restaurant gefiltert (ausser bei "Alle")
- Bei "Alle": `weekNumberToAllIds` fuer Wochen-Zusammenfuehrung nutzen (wie PayrollPortal)

