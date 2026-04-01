

# Bankverbindung unter Lohndaten-Sektion

## Änderungen

### 1. Datenbank-Migration
Drei neue Spalten zur `staff`-Tabelle: `bank_name`, `iban`, `bic` (alle text, nullable).

### 2. `useStaff.ts`
`Staff` und `StaffInput` Interfaces um die drei Felder erweitern. Select-Query und Save-Logik anpassen.

### 3. `StaffDialogNative.tsx`
Neue Untersektion **"Bankverbindung"** innerhalb der bestehenden Collapsible "Lohnabrechnungsdaten" — nach der Adresse und vor der Beschäftigung. Drei Felder:
- Bankname (text)
- IBAN (text, Platzhalter: DE89...)
- BIC (text)

State-Variablen + Init/Reset wie bei den anderen Payroll-Feldern.

| Datei | Änderung |
|---|---|
| Migration (SQL) | 3 Spalten hinzufügen |
| `src/hooks/useStaff.ts` | Interfaces + Query erweitern |
| `src/components/staff/StaffDialogNative.tsx` | Bankverbindung-Felder unter Adresse einfügen |

