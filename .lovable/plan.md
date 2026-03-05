

## Problem: Falsche Spaltenreihenfolge und Duplikat in der Lohnbüro-Buchhaltung

### Analyse

In `PayrollBuchhaltungTab` (Zeilen 1028–1033 in `PayrollPortal.tsx`) gibt es zwei Fehler:

1. **Duplikat**: Zeile 1031 und 1032 zeigen **beide** `totals.evening` — die Spalte wird doppelt angezeigt.
2. **Falsche Reihenfolge**: Die Header-Komponente `BuchhaltungTableHead` erwartet die Reihenfolge: **Gesamt → Schichten → 20–24 → 24–x → So/Fei → U → K → Vorschuss → Besonderheiten**. Aber die Daten-Spalten sind: Gesamt → Schichten → So/Fei → Evening → Evening(Duplikat!) → Night → U → K → Vorschuss → Besonderheiten.

### Fix

In `PayrollPortal.tsx` die Zeilen 1028–1033 korrigieren, sodass die Daten-Spalten mit den Headern übereinstimmen:

```
Gesamt → Schichten → Evening(20-24) → Night(24-x) → SoFei → U → K → Vorschuss → Besonderheiten
```

Das ist eine reine Spaltenreihenfolge-Korrektur — 3 Zeilen ändern, Duplikat entfernen.

