

# Datum gross anzeigen auf der Tagesabrechnungs-Seite

## Aenderung

Die Datumsanzeige "Samstag, 7. Februar 2026" wird deutlich groesser und prominenter dargestellt -- aktuell ist sie nur ein kleiner grauer Untertitel.

## Umsetzung

In `src/pages/DailySummary.tsx` (Zeile 1001-1003):

**Vorher:**
```
<p className="text-muted-foreground mt-1">
  Komplette Uebersicht fuer {format(...)}
</p>
```

**Nachher:**
```
<p className="text-xl lg:text-2xl font-semibold text-foreground mt-1">
  {format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })}
</p>
```

- Schriftgroesse wird von Standard auf `text-xl` / `text-2xl` erhoeht
- Farbe wird von grau (`text-muted-foreground`) auf schwarz (`text-foreground`) geaendert
- Der Praefix "Komplette Uebersicht fuer" wird entfernt, sodass nur das Datum stehen bleibt (wie im Screenshot)

## Datei

| Datei | Aenderung |
|-------|-----------|
| `src/pages/DailySummary.tsx` | Zeile 1001-1003: Datum-Anzeige vergroessern und vereinfachen |

