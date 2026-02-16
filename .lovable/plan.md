

# Einmalige Korrekturbuchung fuer Kassenbestand = 2.000 EUR

## Uebersicht

Die `register_transfers`-Tabelle existiert bereits in der Datenbank, wird aber aktuell nicht in die Bargeld-Berechnung einbezogen. Wir integrieren diese Tabelle in die Berechnungslogik und erstellen dann fuer beide Restaurants Korrekturbuchungen, die den Kassenbestand exakt auf 2.000 EUR bringen.

## Warum ist der Kassenbestand aktuell nicht 2.000 EUR?

Obwohl das Wechselgeld (Petty Cash) auf 2.000 EUR eingestellt ist, kann der Kassenbestand darunter liegen, wenn einzelne Tage ein negatives Bargeld-Ergebnis hatten, das noch nicht aufgeholt wurde. Die Skimming-Logik deckelt nur nach oben (auf 2.000 EUR), federt aber Defizite nicht ab.

## Loesung

### Schritt 1: register_transfers in die Bargeld-Berechnung einbinden

Die Datei `src/hooks/useCashBalanceData.ts` wird erweitert:
- register_transfers fuer das Restaurant werden geladen
- Transfers mit Richtung "in" erhoehen das Bargeld am jeweiligen Tag
- Transfers mit Richtung "out" reduzieren das Bargeld am jeweiligen Tag
- Die Transfers werden nach Datum den Sessions zugeordnet

### Schritt 2: Korrekturbetrag ermitteln

Nach der Code-Aenderung wird der aktuelle Kassenbestand fuer beide Restaurants geprueft. Die Differenz zu 2.000 EUR ergibt den Korrekturbetrag.

### Schritt 3: Korrekturbuchungen erstellen

Fuer jedes Restaurant wird ein `register_transfer`-Eintrag erstellt:
- **Datum**: Heutiges Datum (2026-02-16)
- **Richtung**: "in" (Geld wird dem Kassenbestand hinzugefuegt)
- **Betrag**: Exakt die Differenz zu 2.000 EUR
- **Grund**: "Einmalige Korrektur Kassenbestand"

### Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/hooks/useCashBalanceData.ts` | register_transfers laden und in bargeld-Berechnung einbeziehen |
| Datenbank (register_transfers) | Korrekturbuchungen fuer YUM und Spicery einfuegen |

### Was sich NICHT aendert

- Die Skimming-Logik in `useRemainingCash.ts` bleibt unveraendert (nutzt automatisch die korrigierten bargeld-Werte)
- Die Tagesabrechnung zeigt automatisch den korrigierten Kassenbestand
- Die monatliche Bargeld-Uebersicht funktioniert weiterhin korrekt
- Kein neues UI-Element noetig -- die Korrektur fliesst unsichtbar in die Berechnung ein

