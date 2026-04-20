

# Bargeldbestand-Überschuss zum 31.03.2026 für Spicery erfassen

## Ausgangslage
- Tatsächlicher Kassenbestand Spicery zum 31.03.2026: **2.866 €** (inkl. 2.000 € Wechselgeld)
- Effektiver Überschuss über Wechselgeld: **+866 €**
- System aktuell: `initial_cash_deficit = 0`, Carry-Over zum 01.04. = 0 €
- Problem: Die `compute_carry_over`-Logik kappt jeden positiven Übertrag auf 0 (`carryOver = bargeld < 0 ? bargeld : 0`). Ein positiver Anfangsbestand kann derzeit gar nicht abgebildet werden.

## Lösung: Kassentransfer als Korrekturbuchung am 31.03.2026

Wir buchen den 866 € Überschuss als einmaligen **Kassentransfer** (`register_transfers`) ein. Das ist die sauberste Lösung, weil:

- Die Tabelle `register_transfers` ist **bereits in der Carry-Over-Logik** integriert (sowohl im DB-Function `compute_carry_over` als auch im Hook `useCashBalanceData`).
- Transfers werden korrekt mit Vorzeichen verarbeitet (`to_restaurant` = +, sonst = −).
- Die Buchung ist auditierbar (mit `created_by_name` und `reason`).
- Keine Code- oder Schema-Änderung nötig.

### Konkrete Buchung

```sql
INSERT INTO register_transfers (
  restaurant_id, transfer_date, amount, direction, reason, created_by_name
) VALUES (
  'a1710390-ea4d-4bc2-b869-c0c047056b15',  -- Spicery
  '2026-03-31',
  866.00,
  'to_restaurant',
  'Anfangsbestand-Korrektur: tatsächlicher Kassenbestand 2.866 € (inkl. 2.000 € Wechselgeld) zum 31.03.2026',
  'Lasse'
);
```

## Auswirkung
- Bargeld-Tag 31.03. erhöht sich um +866 €
- Carry-Over zum 01.04. enthält den Überschuss (wird beim Skim auf 2.000 € Wechselgeld zurückgeführt → 866 € fließen in „Verbleibendes Bargeld" / Bankeinzahlungs-Topf)
- Bankeinzahlungen ab April reduzieren diesen Bestand korrekt

## Hinweis
Falls Sie den Überschuss lieber einem anderen Datum zuordnen möchten (z. B. 01.04. statt 31.03.), oder als separaten Datensatz in der Liste sichtbar machen wollen statt als Transfer — bitte vor der Umsetzung kurz Bescheid geben.

