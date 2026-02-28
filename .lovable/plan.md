

## Analyse: Zusätzliche Auslöser für den Settlement-Webhook

Aktuell wird `send-settlement` nur beim PDF-Download ausgelöst. Das ist fragil, weil der Webhook übersprungen wird, wenn jemand das PDF nur in der Vorschau ansieht oder die Abrechnung ohne PDF-Export abschließt.

## Mögliche zusätzliche Trigger

### 1. Beim Finalisieren der Tagesabrechnung
Der natürlichste Zeitpunkt. Wenn die Session als `is_finalized = true` markiert wird, sind alle Daten vollständig. Der Webhook wird unabhängig vom PDF-Export ausgelöst.

### 2. Beim Öffnen der PDF-Vorschau (statt nur beim Download)
Bereits beim Generieren der Vorschau sind alle Daten vorhanden. Vorteil: Deckt auch den Fall ab, dass jemand nur die Vorschau öffnet ohne herunterzuladen.

### 3. Deduplizierung
Bei mehreren Triggern (z.B. Finalisieren + PDF-Download) muss sichergestellt werden, dass der Webhook nicht doppelt ausgelöst wird. Aktuell wird er bereits zweimal aufgerufen (siehe Netzwerk-Logs: zwei POST-Requests mit derselben `session_id`). Lösung: Entweder clientseitig ein Flag setzen oder serverseitig in der Edge Function prüfen, ob für diese `session_id` bereits gesendet wurde.

## Empfehlung

**Option 1 (Finalisieren)** als primärer Trigger, kombiniert mit **Deduplizierung**:

- Webhook beim Setzen von `is_finalized = true` auslösen
- PDF-Download-Trigger als Fallback beibehalten
- In `send-settlement` eine `last_sent_at`-Spalte auf der `sessions`-Tabelle prüfen, um Doppelsendungen zu vermeiden (z.B. nur senden wenn `last_settlement_sent_at` null ist oder älter als 5 Minuten)

### Umsetzung
1. Spalte `last_settlement_sent_at` zur `sessions`-Tabelle hinzufügen
2. Edge Function `send-settlement` erweitern: vor dem Webhook-Aufruf prüfen ob kürzlich gesendet, nach Erfolg Timestamp setzen
3. Settlement-Aufruf in die Finalisierungs-Logik einbauen
4. Bestehenden PDF-Download-Trigger beibehalten (mit Deduplizierung)
5. Doppelten Aufruf beim PDF-Download fixen (aktuell zwei Requests)

