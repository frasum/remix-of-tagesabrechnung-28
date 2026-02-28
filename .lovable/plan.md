

## Mitarbeiterverwaltung um Stammdaten erweitern

Die Felder `first_name`, `last_name`, `nickname` und `perso_nr` existieren in der Datenbank, werden aber im StaffDialog weder angezeigt noch bearbeitet. Das wird jetzt nachgeholt.

### 1. `src/hooks/useStaff.ts` — StaffInput erweitern

Neue optionale Felder zu `StaffInput` hinzufuegen:
- `first_name?: string`
- `last_name?: string`  
- `nickname?: string`
- `perso_nr?: number`

In `useCreateStaff` und `useUpdateStaff`: Diese Felder aus `input` extrahieren und an die Supabase-Queries weitergeben (sie werden bereits durch `...staffData` erfasst, muessen nur aus dem Destructuring entfernt werden, damit sie nicht verloren gehen).

### 2. `src/components/staff/StaffDialogNative.tsx` — Formularfelder hinzufuegen

Neue State-Variablen: `firstName`, `lastName`, `nickname`, `persoNr`.

Neue Eingabefelder nach dem bestehenden "Name"-Feld:
- **Vorname** (text input)
- **Nachname** (text input)
- **Spitzname** (text input) 
- **Personalnummer** (number input)

Beim Oeffnen des Dialogs die Werte aus `staff.first_name`, `staff.last_name`, `staff.nickname`, `staff.perso_nr` laden.

Beim Speichern die neuen Felder an `onSave` uebergeben.

### 3. `src/components/staff/StaffCard.tsx` — Anzeige verbessern

Unter dem Namen zusaetzlich Vorname/Nachname und Personalnummer anzeigen, wenn vorhanden (als kleine Zusatzinfo).

### Keine Datenbank-Aenderungen noetig
Die Spalten `first_name`, `last_name`, `nickname`, `perso_nr` existieren bereits in der `staff`-Tabelle.

