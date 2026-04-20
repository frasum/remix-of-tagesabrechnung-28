

# YUM Übertrag aus Vormonat auf −141 € korrigieren

## Aktueller Stand
- Berechneter Übertrag (vor 01.04.2026): **−281,36 €**
- Gewünschter Übertrag: **−141,00 €**
- Fehlbetrag im System: **140,36 €** zu wenig Bargeld

## Ursache
Es fehlt eine Bareinlage / Tresor-Übertrag von **140,36 €** in der Historie vor April 2026.

## Lösung
Einen `register_transfers`-Eintrag mit Richtung `to_restaurant` (erhöht Bargeld im Restaurant) anlegen:

| Feld | Wert |
|---|---|
| restaurant_id | `3065f458-…` (YUM) |
| transfer_date | `2026-03-31` |
| amount | `140.36` |
| direction | `to_restaurant` |
| reason | „Korrektur Übertragsabgleich März 2026" |
| created_by_name | `System` |

## Ergebnis nach Insert
- Übertrag aus Vormonat im April 2026: **−141,00 €** ✅
- Tageswerte bleiben unverändert
- Keine Code- oder Schema-Änderungen

## Alternative
Falls der Betrag stattdessen als **Bankeinzahlung** (`bank_deposits`) verbucht werden soll, würde das den Übertrag in die *falsche* Richtung verschieben (auf −421,72 €). Daher ist `register_transfers / to_restaurant` der korrekte Weg. Sag Bescheid, falls du ein anderes Datum (z. B. innerhalb März verteilt) oder eine andere Begründung möchtest.

