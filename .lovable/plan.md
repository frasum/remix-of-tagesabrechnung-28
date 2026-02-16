
# Wechselgeld (Petty Cash) auf 2.000 EUR aendern

## Was passiert

Das Wechselgeld-Limit fuer **YUM** wird von **2.535,46 EUR** auf **2.000,00 EUR** geaendert.
**Spicery** ist bereits auf 2.000 EUR eingestellt -- keine Aenderung noetig.

## Auswirkung

- Die Skimming-Logik ("Abschoepfung") greift bei YUM ab sofort bei 2.000 EUR statt bei 2.535 EUR
- Uebersteigt der Kassenbestand am Ende eines Tages 2.000 EUR, wird der Ueberschuss als "Bargeld in die Abrechnung" ausgewiesen
- Der angezeigte Kassenbestand wird auf maximal 2.000 EUR gedeckelt

## Technische Umsetzung

Eine einzige Datenbank-Aktualisierung in der `settings`-Tabelle:

```text
UPDATE settings
SET value = '{"amount": 2000}'
WHERE key = 'petty_cash' AND restaurant_id = [YUM-ID]
```

Keine Code-Aenderungen erforderlich.
