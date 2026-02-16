

## YUM-Korrekturbuchung erhoehen

Die bestehende `register_transfers`-Buchung fuer YUM am 15.02. wird von 542,43 EUR auf **3.168,64 EUR** erhoeht.

### Aenderung
- **Tabelle**: `register_transfers`
- **Datensatz**: Bestehende Korrektur vom 15.02.2025 fuer YUM (Restaurant-ID: `64e1a17a-...`)
- **Feld**: `amount`
- **Alt**: 542,43 EUR
- **Neu**: 3.168,64 EUR

### Ergebnis
Der Wechselgeldbestand fuer YUM am 15. Februar wird auf **2.000 EUR** korrigiert.

### Technisch
Ein einzelnes SQL-UPDATE auf die `register_transfers`-Tabelle. Keine Code-Aenderungen noetig.

