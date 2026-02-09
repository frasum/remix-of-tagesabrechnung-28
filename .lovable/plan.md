
# Vorschuss-Liste: Mitarbeiter-basierte Vorschuss-Erfassung

## Uebersicht
Das bisherige einzelne "Vorschuss"-Eingabefeld wird durch eine Liste ersetzt, aehnlich wie die Ausgaben-Sektion. Statt einer freien Beschreibung gibt es ein Mitarbeiter-Dropdown und einen Betrag. Das macht die Monatsabrechnung uebersichtlicher, weil man sieht, welcher Mitarbeiter wann wie viel Vorschuss bekommen hat.

## Neue Datenbank-Tabelle

Eine neue Tabelle `advances` (Vorschuesse) wird erstellt:

```text
advances
---------
id            uuid (PK, default gen_random_uuid())
session_id    uuid (FK -> sessions.id, NOT NULL)
staff_name    text (NOT NULL)
amount        numeric (NOT NULL)
created_at    timestamptz (default now())
```

RLS-Policy: `Allow advances access via app` (ALL, using: true) -- analog zu expenses.

## Aenderungen

### 1. Datenbank-Migration
- Neue Tabelle `advances` erstellen
- RLS aktivieren + Policy hinzufuegen

### 2. Neuer Hook: `src/hooks/useAdvances.ts`
- `useAdvances(sessionId)` -- laedt alle Vorschuesse fuer eine Session
- `useCreateAdvance()` -- neuen Vorschuss erstellen
- `useDeleteAdvance()` -- Vorschuss loeschen
- Gleiche Struktur wie die Expense-Hooks in `useSession.ts`

### 3. DailySummary.tsx anpassen
- Das einzelne Vorschuss-Feld in der "Sonstiges"-Card entfernen
- Neue "Vorschuss"-Card unterhalb der Ausgaben-Card einfuegen:
  - Dropdown mit `StaffSelect` (alle Mitarbeiter, nicht nur Kellner oder Kueche)
  - `CurrencyInput` fuer den Betrag
  - Plus-Button zum Hinzufuegen
  - Liste der erfassten Vorschuesse mit Loeschen-Button
  - Summe am Ende
- `formData.vorschuss` wird ersetzt durch `totalAdvances` (Summe aus der advances-Tabelle)
- Die Bargeld-Berechnung nutzt `totalAdvances` statt `formData.vorschuss`
- Die Session-Tabelle behaelt das `vorschuss`-Feld fuer Rueckwaertskompatibilitaet, wird aber nicht mehr als Eingabe verwendet

### 4. ManagerDashboard.tsx anpassen
- Gleiche Aenderung: Vorschuss-Feld durch die Liste ersetzen
- Oder alternativ: totalAdvances aus der advances-Tabelle lesen

### 5. PDF-Export anpassen (`pdfExport.ts`)
- Statt `session.vorschuss` die Summe der advances verwenden
- Optional: Vorschuss-Details (Mitarbeiter + Betrag) als eigene Tabelle im PDF auflisten

### 6. Kassenbestand / CashBalance anpassen
- `useCashBalanceData.ts`: `vorschuss` aus der advances-Tabelle summieren statt aus session.vorschuss

## Ablauf im UI

```text
+------------------------------------------+
|  Vorschuss                               |
+------------------------------------------+
|  [Mitarbeiter-Dropdown v]  [0,00 €]  [+] |
|                                          |
|  Max Mustermann          50,00 EUR  [x]  |
|  Lisa Mueller            30,00 EUR  [x]  |
|  ─────────────────────────────────────── |
|  Summe:                  80,00 EUR       |
+------------------------------------------+
```

## Technische Details

- Die `StaffSelect`-Komponente wird ohne Rollen-Filter verwendet (oder ein neuer Modus "all"), damit alle Mitarbeiter (Kellner, Kueche, Beides) im Dropdown erscheinen
- Das `session.vorschuss`-Feld in der Datenbank bleibt bestehen, wird aber bei neuen Eintraegen automatisch mit der Summe der advances synchronisiert (oder ignoriert)
- Die Bargeld-Formel aendert sich von `formData.vorschuss` zu `totalAdvances`
