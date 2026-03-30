

# Vergleichstabelle kompakter und eindeutiger gestalten

## Problem

Die aktuelle Tabelle hat 13 Spalten mit Doppel-Spalten (eigen/Lohnbüro) für jeden Wert. Das ist schwer lesbar und erfordert horizontales Scrollen.

## Neues Layout: Delta-basierte Darstellung

Statt zwei Spalten pro Kennzahl (eigen + Lohnbüro) wird **eine Spalte pro Kennzahl** mit dem eigenen Wert gezeigt. Der Lohnbüro-Wert erscheint als **Delta darunter** — nur wenn es eine Abweichung gibt.

```text
Vorher (13 Spalten):
| Name | Std. (eigen) | Std. (Lohnb.) | €/h (eigen) | €/h (Lohnb.) | Brutto (eigen) | Brutto (Lohnb.) | ...

Nachher (7 Spalten):
| Name | Stunden | €/h | Brutto | Netto | SFN | Auszahlung |
|      | 166,88  | 14,00 | 2.336 | 1.673 | 373 | 2.046      |
|      | ↑ 0,12  |   ✓   | ↑ 532 | ↑ 544 | ↑ 2 | ↑ 16       |
```

### Konkrete Änderungen

1. **Spalten reduzieren**: Von 13 auf 7 Spalten (Name + 6 Kennzahlen)
2. **Zwei-Zeilen-Layout pro Mitarbeiter**:
   - Zeile 1: Eigener Wert (schwarz)
   - Zeile 2: Delta zum Lohnbüro — grün bei Übereinstimmung (✓), rot mit Pfeil + Betrag bei Abweichung
3. **Farbige Status-Icons**:
   - `✓` grün = Werte stimmen überein (< 1 € Differenz)
   - `↑ 532 €` rot = Lohnbüro höher
   - `↓ 50 €` orange = Lohnbüro niedriger
4. **Match-Status als Badge** am Namen: grüner Punkt bei Match, grauer "(kein Match)" Text
5. **Gesamt-Abweichungs-Summe** am Ende der Tabelle

### Betroffene Datei

| Datei | Änderung |
|---|---|
| `src/components/zeiterfassung/BatchPayrollCalculation.tsx` | Vergleichstabelle von Doppel-Spalten auf Delta-Layout umbauen (Zeilen 818–885) |

