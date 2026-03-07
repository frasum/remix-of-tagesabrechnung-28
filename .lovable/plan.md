

# Plan: Konfigurierbarer Provisionsprozentsatz

## Änderung in `src/pages/zeiterfassung/ZtProvision.tsx`

1. **Neuer State `commissionPct`** (Standard: 5) — analog zu `minRevenue`
2. **Laden/Speichern** über `settings`-Tabelle mit Key `commission_pct` (Wert: `{ pct: 5 }`)
3. **Neues Eingabefeld** neben dem Mindest-Durchschnittsumsatz: ein `Input` mit Suffix `%` für den Prozentsatz
4. **Pool-Berechnung** anpassen: `pool = excess * (commissionPct / 100)` statt hardcoded `0.05`

### UI-Layout (oberer Bereich)

Zwei Felder nebeneinander:
- Links: Mindest-Durchschnittsumsatz (bestehendes `CurrencyInput`)
- Mitte: Provisionssatz (`CurrencyInput` mit `suffix="%"`, Standard 5)
- Rechts: Status-Badge (wie bisher)

Keine DB-Migration nötig — nutzt die bestehende `settings`-Tabelle.

