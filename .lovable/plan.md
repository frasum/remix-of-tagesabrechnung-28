

# Phase 1: Sofortmeldung — DB, neue Felder, Prüfung & Status

## Überblick

Phase 1 erweitert den bestehenden „Neuen Mitarbeiter anlegen"-Flow um die Sofortmeldungspflicht nach §28a SGB IV. Da die Gastronomie immer meldepflichtig ist, wird bei jedem neuen Mitarbeiter automatisch `sofortmeldung_required = true` gesetzt. Es wird eine Statuslogik eingeführt, fehlende Pflichtfelder werden ergänzt, und der Meldestatus wird im Dialog und in der Mitarbeiterverwaltung sichtbar.

---

## 1. Datenbank-Migration

### Neue Spalten in `staff`-Tabelle
- `address_street` (text, nullable)
- `address_zip` (text, nullable)
- `address_city` (text, nullable)
- `work_start_time` (time, nullable) — Uhrzeit Arbeitsbeginn am ersten Tag
- `employment_type` (text, nullable) — z.B. "Vollzeit", "Teilzeit", "Minijob", "Aushilfe"
- `activity_description` (text, nullable) — Tätigkeit/Rolle für Meldung

### Neue Tabelle `sofortmeldung`
```
id                  uuid PK
staff_id            uuid NOT NULL (ref staff.id ON DELETE CASCADE)
status              text NOT NULL DEFAULT 'entwurf'
                    -- entwurf | unvollstaendig | bereit | erforderlich | gemeldet | fehler
sofortmeldung_required boolean DEFAULT true
missing_fields      jsonb  -- Array der fehlenden Pflichtfelder
validated_at        timestamptz
exported_at         timestamptz
reported_at         timestamptz
error_message       text
export_format       text  -- json | csv | pdf
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
created_by_name     text
```
RLS: `true` für alle (analog zu bestehenden Tabellen).

### Neue Tabelle `sofortmeldung_log`
```
id                  uuid PK
sofortmeldung_id    uuid NOT NULL (ref sofortmeldung.id)
action              text NOT NULL -- status_change | validation | export | error
old_status          text
new_status          text
details             jsonb
performed_by_name   text
created_at          timestamptz DEFAULT now()
```
RLS: SELECT = true, INSERT = true, UPDATE/DELETE = false.

---

## 2. Erweiterung StaffDialogNative.tsx

### Neue Felder im Dialog (im Bereich "Lohnabrechnungsdaten")
- **Adresse** (Straße, PLZ, Ort) — 3 Felder
- **Uhrzeit Arbeitsbeginn** — time Input
- **Beschäftigungsart** — Dropdown (Vollzeit, Teilzeit, Minijob, Aushilfe)
- **Tätigkeit** — Textfeld

### Sofortmeldungs-Hinweisbanner
Nach dem Abschnitt "Lohnabrechnungsdaten" ein auffälliges Banner:
- Amber/Orange: "⚡ Sofortmeldung erforderlich — Gastronomie (§28a SGB IV)"
- Zeigt fehlende Pflichtfelder als Liste an
- Farbiger Status-Badge: Entwurf (grau), Unvollständig (rot), Bereit (grün), Gemeldet (blau)

### Validierung
Pflichtfelder für "Bereit zur Meldung": Vorname, Nachname, Geburtsdatum, Eintrittsdatum, Krankenkasse, Nationalität, mindestens 1 Restaurant. Fehlende Felder werden als verständliche Hinweise angezeigt.

---

## 3. Neue Dateien

### `src/types/sofortmeldung.ts`
TypeScript-Interfaces: `Sofortmeldung`, `SofortmeldungLog`, `SofortmeldungStatus`, `SofortmeldungValidationResult`.

### `src/hooks/useSofortmeldung.ts`
- `useSofortmeldung(staffId)` — lädt Meldestatus für einen Mitarbeiter
- `useCreateSofortmeldung()` — erstellt Meldevorgang nach Mitarbeiteranlage
- `useValidateSofortmeldung()` — prüft Pflichtfelder, aktualisiert Status
- `useUpdateSofortmeldungStatus()` — Status ändern + Log-Eintrag

### `src/lib/sofortmeldungService.ts`
Abstrahierte Service-Klasse `SofortmeldungService`:
- `validate(staff)` → `{ isComplete, missingFields }`
- `checkRequired()` → `true` (Gastro = immer)
- `exportJSON(staff, meldung)` → strukturierter JSON-Download
- `exportCSV(staff, meldung)` → CSV-Download
- `exportPDF(staff, meldung)` → PDF-Meldebogen (vorbereitet)
- `submit(staff, meldung)` → Placeholder für externe Anbindung

### `src/components/staff/SofortmeldungBanner.tsx`
Wiederverwendbare Komponente: zeigt Status, fehlende Felder, Action-Buttons ("Export erstellen", "Sofortmeldung vorbereiten").

---

## 4. Workflow nach Speichern

Im `useCreateStaff`-Hook (nach erfolgreichem Insert):
1. `sofortmeldung`-Eintrag anlegen mit `status = 'entwurf'`
2. Validierung ausführen → fehlende Felder speichern
3. Status automatisch setzen: `unvollstaendig` (wenn Felder fehlen) oder `bereit` (wenn alles da)
4. Log-Eintrag anlegen

---

## 5. Anzeige in StaffMatrixView / StaffManagement

- Kleiner Status-Badge neben dem Mitarbeiternamen in der Matrix (nur bei neuen Mitarbeitern mit offener Meldung)
- Beim Bearbeiten eines Mitarbeiters: Sofortmeldungs-Abschnitt im Dialog mit aktuellem Status und Aktionsbuttons

---

## Was Phase 1 NICHT enthält (kommt in Phase 2+)
- Separates Compliance-Dashboard
- PDF-Meldebogen-Generation
- Export an externes Lohnsystem
- Edge Function für Meldungs-Workflow

## Betroffene bestehende Dateien
- `src/components/staff/StaffDialogNative.tsx` (neue Felder + Banner)
- `src/hooks/useStaff.ts` (neue Felder in StaffInput, Post-Create-Hook)
- `src/pages/StaffManagement.tsx` (Status-Badge in Matrix)
- `src/components/staff/StaffMatrixView.tsx` (Status-Indikator)

## Neue Dateien
- `src/types/sofortmeldung.ts`
- `src/hooks/useSofortmeldung.ts`
- `src/lib/sofortmeldungService.ts`
- `src/components/staff/SofortmeldungBanner.tsx`

