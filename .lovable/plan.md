

# Plan: Provisionsberechnung auf "Pro Tag pro Mitarbeiter" umstellen

## Was sich ändert

Die Berechnung in `ZtProvision.tsx` muss angepasst werden:

**Aktuell:**
```
Ø Umsatz = Gesamtumsatz / Anzahl Tage
Überbetrag = Gesamtumsatz - (Schwellwert × Anzahl Tage)
```

**Neu:**
```
Staff-Tage = Summe der Mitarbeiteranzahl pro Tag (z.B. 3 Tage × je 4 Kellner = 12 Staff-Tage)
Ø Umsatz/Tag/MA = Gesamtumsatz / Staff-Tage
Überbetrag = Gesamtumsatz - (Schwellwert × Staff-Tage)
Pool = Überbetrag × 5%
```

## Änderung in `src/pages/zeiterfassung/ZtProvision.tsx`

1. **Neues Aggregat `staffDays`**: Für jede Session (Tag) die Anzahl der **distinkten Mitarbeiter** zählen und summieren.
2. **`avgRevenue`**: `totalRevenue / staffDays` statt `totalRevenue / sessionCount`
3. **Pool-Berechnung**: `excess = totalRevenue - (minRevenue × staffDays)`
4. **Label anpassen**: "Ø Umsatz / Tag" → "Ø Umsatz / Tag / MA" und ggf. "Abrechnungstage" durch "Staff-Tage" ergänzen

Keine DB-Änderungen nötig — reine Frontend-Logik-Anpassung in einer Datei.

