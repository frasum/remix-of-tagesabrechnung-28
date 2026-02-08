
# Plan: Audit-Log für Kellner-Abrechnungsänderungen

## Übersicht
Wir erstellen ein Änderungsprotokoll (Audit-Log), das automatisch dokumentiert, wenn eine bereits erstellte Kellner-Abrechnung bearbeitet wird. Dabei werden Datum, Uhrzeit und der Name der Person erfasst, die die Änderung vorgenommen hat.

## Ansatz

Es gibt zwei Optionen für die Implementierung:

### Option A: Datenbank-Trigger (empfohlen)
Ein PostgreSQL-Trigger erfasst jede Änderung an der `waiter_shifts`-Tabelle automatisch und schreibt einen Eintrag in eine neue `audit_logs`-Tabelle.

**Vorteile:**
- Lückenlose Protokollierung, auch bei direkten Datenbank-Änderungen
- Keine Änderungen am Frontend-Code nötig
- Erfasst auch den vorherigen und neuen Wert

**Nachteile:**
- Der "Name" der Person kommt aus dem Frontend (AuthContext), nicht aus der Datenbank selbst. Ein reiner Trigger weiß nicht, wer eingeloggt ist.

### Option B: Frontend-basiertes Logging (pragmatisch)
Bei jedem Update einer `waiter_shift` wird zusätzlich ein Log-Eintrag in eine `audit_logs`-Tabelle geschrieben - direkt aus dem `useUpdateWaiterShift`-Hook.

**Vorteile:**
- Einfacher Zugang zum eingeloggten Benutzer (`useAuth`)
- Volle Kontrolle über Format und Inhalt

**Nachteile:**
- Nur Änderungen über die App werden erfasst

---

## Empfohlene Lösung: Kombination (Option B mit Erweiterung)

Da die App den eingeloggten Benutzer kennt (`useAuth`), ist ein Frontend-basiertes Logging am praktischsten.

## Implementierungsschritte

### 1. Neue Datenbank-Tabelle `audit_logs` erstellen

```text
+------------------+-------------------------+
| audit_logs                                 |
+------------------+-------------------------+
| id               | uuid (PK)               |
| created_at       | timestamp               |
| table_name       | text                    |
| record_id        | uuid                    |
| action           | text (update/delete)    |
| changed_by_id    | uuid (staff.id)         |
| changed_by_name  | text                    |
| old_values       | jsonb                   |
| new_values       | jsonb                   |
| restaurant_id    | uuid                    |
+------------------+-------------------------+
```

### 2. Hook `useUpdateWaiterShift` erweitern
- Vor dem Update: Alten Datensatz laden
- Nach dem Update: Audit-Log-Eintrag schreiben mit:
  - Alten Werten
  - Neuen Werten
  - Name und ID des eingeloggten Benutzers

### 3. Neuen Hook `useAuditLogs` erstellen
- Lädt Audit-Logs für eine Session oder einen bestimmten Zeitraum
- Filtert nach `table_name = 'waiter_shifts'`

### 4. UI-Komponente für das Audit-Log
- Neue Seite oder Collapsible-Bereich im Manager-Dashboard
- Zeigt chronologisch alle Änderungen:
  - Wann (Datum + Uhrzeit)
  - Wer (Name des Bearbeiters)
  - Was wurde geändert (vorher → nachher)

---

## Technische Details

### Datenbank-Migration
```sql
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changed_by_id uuid,
  changed_by_name text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  restaurant_id uuid NOT NULL
);

-- RLS Policy (nur lesen für authentifizierte Benutzer)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to audit_logs" 
  ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
```

### Betroffene Dateien
| Datei | Änderung |
|-------|----------|
| `src/hooks/useSession.ts` | `useUpdateWaiterShift` erweitern, um Audit-Log zu schreiben |
| `src/hooks/useAuditLogs.ts` | Neuer Hook zum Laden der Logs |
| `src/types/database.ts` | Neuer Type `AuditLog` |
| `src/pages/History.tsx` oder neues `/audit-log` | UI zum Anzeigen der Logs |

---

## Beispiel-Anzeige

```text
┌─────────────────────────────────────────────────────────────┐
│ Änderungsprotokoll                                          │
├─────────────────────────────────────────────────────────────┤
│ 07.02.2026, 22:45 Uhr - Frank                               │
│ Kellner-Abrechnung von "Max" geändert:                      │
│   • Bargeld abgegeben: 350,00 € → 380,00 €                  │
│   • Kartenzahlung: 120,00 € → 125,00 €                      │
├─────────────────────────────────────────────────────────────┤
│ 07.02.2026, 21:30 Uhr - Lisa                                │
│ Kellner-Abrechnung von "Tim" geändert:                      │
│   • Umsatz: 500,00 € → 520,00 €                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Zusammenfassung

1. **Neue Tabelle** `audit_logs` in der Datenbank
2. **Hook erweitern** `useUpdateWaiterShift` schreibt bei Updates automatisch ein Protokoll
3. **Neuer Hook** `useAuditLogs` zum Abrufen der Logs
4. **UI-Anzeige** im History-Bereich oder als eigene Seite
