

## AI-Chat nur fuer Admins

### Aenderungen

| Datei | Beschreibung |
|---|---|
| `supabase/functions/restaurant-chat/index.ts` | Neue Edge Function: empfaengt Frage + Restaurant-IDs, laedt relevante Daten (Sessions, Schichten, Ausgaben, Kuechenschichten der letzten 90 Tage) aus der DB, sendet alles an Lovable AI Gateway (google/gemini-2.5-flash). Antwort als SSE-Stream. Validiert `caller_staff_id` serverseitig als Admin via `get_staff_permission`. |
| `supabase/config.toml` | `[functions.restaurant-chat]` mit `verify_jwt = false` eintragen. |
| `src/pages/RestaurantChat.tsx` | Chat-Seite: Nachrichtenliste, Eingabefeld, Streaming-Antworten, Vorschlags-Chips ("Umsatz diese Woche?", "Wer hat gestern gearbeitet?"). |
| `src/App.tsx` | Route `/:restaurant/chat` mit `requiredLevel="admin"` hinzufuegen. |
| `src/components/layout/AppLayout.tsx` | Chat-Link in der Sidebar nur fuer Admins (neben Mitarbeiter/Telegram), mit MessageCircle-Icon. |

### Sicherheit

- Route ist durch `ProtectedRoute requiredLevel="admin"` geschuetzt
- Edge Function prueft serverseitig via `get_staff_permission(caller_staff_id)` ob der Aufrufer Admin ist
- Navigation wird nur fuer Admins (`isAdmin`) angezeigt

### Edge Function Datenabfrage

Pro Anfrage werden kompakte Daten der letzten 90 Tage geladen:
- Sessions (Datum, Restaurant, Umsatz, Kreditkarten, Delivery, Gaestezahl)
- Waiter Shifts (Name, Umsatz, Trinkgeld)
- Kitchen Shifts (Name, Stunden)
- Expenses + Advances (Betrag, Beschreibung)
- Staff-Liste (aktive Mitarbeiter, Rolle)

System-Prompt auf Deutsch, Zahlen als Euro formatiert, Konversationsverlauf clientseitig.

