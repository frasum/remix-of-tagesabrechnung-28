

# Neue Spalte: Gaeste / Ø Verzehr (kombiniert)

## Was wird hinzugefuegt

Eine einzelne neue Spalte in der Verlaufstabelle, die beide Werte kompakt untereinander oder nebeneinander anzeigt:

| Datum | POS Total | Kreditkarten (%) | Take Away (%) | Gaeste / Ø Verzehr | Tages-Bargeld | |

### Darstellung in der Zelle

```text
42 Gaeste
Ø 48,20 EUR
```

- Erste Zeile: Anzahl Gaeste
- Zweite Zeile (kleiner, muted): Durchschnittsverzehr pro Gast
- Berechnung Durchschnitt: (POS Total - Takeaway) / Gaeste
- Bei 0 Gaesten wird nur ein Strich angezeigt

## Technische Details

### Datei: `src/pages/History.tsx`

1. **Tabellenkopf**: Eine neue `<TableHead>` Spalte "Gaeste / Ø Verzehr" nach "Take Away (%)" und vor "Tages-Bargeld" einfuegen (rechtsbuendig).

2. **Tabellenzelle**: Eine neue `<TableCell>` mit zwei Zeilen:
   - `session.guest_count` als Hauptwert anzeigen (z.B. "42 Gaeste")
   - Darunter in kleiner, muted Schrift: Durchschnittsverzehr berechnen als `(posTotal - takeaway) / guestCount` und als Waehrung formatieren mit "Ø" Praefix
   - Falls `guest_count` 0 oder nicht vorhanden: nur "–" anzeigen

Keine zusaetzlichen Datenbank-Abfragen noetig, da `guest_count` bereits in der Session-Daten enthalten ist.

