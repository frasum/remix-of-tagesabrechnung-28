
# Plan: Bankeinzahlungen für Bargeldbestand

## Übersicht

Wir fügen eine Funktion hinzu, um Bankeinzahlungen zu erfassen. Oben auf der Bargeldbestand-Seite wird eine Zusammenfassungs-Karte angezeigt, die den **aktuellen Kassenbestand** zeigt (Gesamtbargeld minus alle Bankeinzahlungen).

## Was du bekommst

```text
┌─────────────────────────────────────────────────────────────────┐
│  💰 Aktueller Kassenbestand                                     │
│                                                                 │
│  Bargeld gesamt:     12.450,00 €                               │
│  Bankeinzahlungen:   -8.000,00 €                               │
│  ───────────────────────────────                               │
│  Verbleibendes:       4.450,00 €        [+ Einzahlung]         │
│                                                                 │
│  Letzte Einzahlung: 05.02.2026 - 3.000,00 €                    │
└─────────────────────────────────────────────────────────────────┘
```

**Button "Einzahlung hinzufügen"** öffnet einen Dialog:
- Datum auswählen (mit Kalender)
- Betrag eingeben
- Optionale Notiz (z.B. "Wochenbetrag", "Monatsendzahlung")

**Liste der Einzahlungen** unterhalb der Zusammenfassung:
- Zeigt alle Bankeinzahlungen chronologisch
- Mit Lösch-Option falls versehentlich falsch eingetragen

---

## Technische Umsetzung

### 1. Neue Datenbank-Tabelle: `bank_deposits`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| id | uuid | Primärschlüssel |
| deposit_date | date | Datum der Einzahlung |
| amount | numeric | Betrag in Euro |
| notes | text | Optionale Notiz |
| created_at | timestamp | Erstellungszeitpunkt |

**RLS-Policy:** Öffentlicher Zugriff (wie bei den anderen Tabellen)

### 2. Neue Dateien

| Datei | Zweck |
|-------|-------|
| `src/hooks/useBankDeposits.ts` | Hook für CRUD-Operationen auf `bank_deposits` |
| `src/components/cash-balance/CashBalanceSummary.tsx` | Zusammenfassungs-Karte mit aktuellem Kassenbestand |
| `src/components/cash-balance/BankDepositDialog.tsx` | Dialog zum Hinzufügen einer Einzahlung |
| `src/components/cash-balance/BankDepositList.tsx` | Liste aller Einzahlungen mit Lösch-Option |

### 3. Änderungen an bestehenden Dateien

**`src/pages/CashBalance.tsx`:**
- Import der neuen Komponenten
- Integration der Zusammenfassungs-Karte über der Tabelle
- Berechnung: `Kassenbestand = Bargeld gesamt - Bankeinzahlungen`

**`src/hooks/useCashBalanceData.ts`:**
- Bleibt unverändert (berechnet weiterhin das tägliche Bargeld)

### 4. Ablauf

```text
+------------------+     +-------------------+     +------------------+
| Nutzer klickt    | --> | Dialog öffnet     | --> | Speichern in     |
| "Einzahlung"     |     | mit Formular      |     | bank_deposits    |
+------------------+     +-------------------+     +------------------+
                                                          |
                                                          v
+------------------+     +-------------------+     +------------------+
| UI aktualisiert  | <-- | React Query       | <-- | Daten neu laden  |
| Kassenbestand    |     | invalidiert Cache |     |                  |
+------------------+     +-------------------+     +------------------+
```

---

## Vorteile dieser Lösung

- **Einfach:** Nur eine neue Tabelle, keine Änderung an bestehenden Daten
- **Übersichtlich:** Kassenbestand auf einen Blick sichtbar
- **Flexibel:** Einzahlungen können nachträglich korrigiert werden
- **Konsistent:** Folgt dem bestehenden Muster (wie `expenses` Tabelle)

