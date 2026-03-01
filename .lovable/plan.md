

## Plan: Öffentlicher Sharing-Link für Lohnbüro

### Konzept
Auf der Perioden-Seite bekommt jede Periode einen "Freigabe"-Button. Beim Klick wird ein zufälliger Token generiert und in der Datenbank gespeichert. Der daraus resultierende Link (z.B. `https://tagesabrechnung.lovable.app/shared/zt/abc123...`) ist ohne Login aufrufbar und zeigt eine eigenständige Ansicht mit Wochenplan, Zusammenfassung und Buchhaltung — ausschließlich für diese eine Periode.

Das Lohnbüro kann dort Daten einsehen, Besonderheiten/Vorschuss bearbeiten und PDF/Excel exportieren. Der Link kann jederzeit widerrufen werden.

---

### Datenbank-Änderungen

**`scheduling_periods`-Tabelle erweitern:**
- `share_token TEXT` (nullable, unique) — zufälliger Token für den Sharing-Link
- `shared_at TIMESTAMPTZ` — Zeitpunkt der Freigabe

---

### Backend (Edge Function)

**Neue Edge Function `shared-zt-data`:**
- Validiert den `share_token` gegen `scheduling_periods`
- Gibt Perioden-Infos, Wochen, Schichten, Mitarbeiterdaten und Payroll Notes zurück
- Erlaubt auch POST-Requests zum Aktualisieren von `payroll_notes` (Besonderheiten, Vorschuss)
- Kein JWT erforderlich (`verify_jwt = false`)

---

### Frontend-Änderungen

**1. Neue Route in `App.tsx`:**
- `/shared/zt/:token` — öffentliche Route ohne Auth/Restaurant-Context

**2. Neue Seite `src/pages/shared/SharedZtView.tsx`:**
- Standalone-Layout (kein Sidebar, keine Navigation)
- Liest Token aus URL, ruft Edge Function auf
- Tabs: Wochenplan, Zusammenfassung, Buchhaltung
- Nutzt dieselbe Darstellungslogik, aber mit eigenen Datenquellen (kein ZtContext)
- Bearbeitung von Besonderheiten/Vorschuss möglich
- PDF/Excel-Export verfügbar

**3. Perioden-Seite (`ZtPerioden.tsx`) erweitern:**
- "Freigeben"-Button pro Periode → generiert Token und speichert es
- Anzeige des Sharing-Links mit Copy-Button wenn bereits freigegeben
- "Widerrufen"-Button um Token zu löschen

---

### Sicherheit
- Tokens sind kryptografisch zufällig (32 Bytes hex-encoded)
- Kein Login erforderlich — der Token IST die Autorisierung
- Token kann jederzeit widerrufen werden (Token auf NULL setzen)
- Zugriff nur auf die eine freigegebene Periode, keine anderen Daten

