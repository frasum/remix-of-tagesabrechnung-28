
# Takeaway-Anteil in Prozent anzeigen

## Aenderung
In der **TAKE AWAY**-Sektionsüberschrift im ExcelLayout wird der prozentuale Anteil des gesamten Takeaway-Umsatzes am POS-Gesamtumsatz angezeigt.

## Berechnung
```
Takeaway-Gesamt = takeaway_total + ordersmart_revenue + wolt_revenue
Prozent = (Takeaway-Gesamt / pos_total) * 100
```

## Darstellung
Die Prozentzahl erscheint dezent rechts neben dem "TAKE AWAY"-Titel in der gruenen Sektionsleiste:

```
 TAKE AWAY                                    12,5 %
```

Formatierung: kleiner, grauer Text (`text-xs text-muted-foreground`), rechtsbündig.

## Technische Details

### Datei: `src/components/daily-summary/layouts/ExcelLayout.tsx`
- Zeile 198-199: Die Sektionsüberschrift wird um eine Prozentberechnung erweitert
- Berechnung direkt inline aus `formData.takeaway_total`, `formData.ordersmart_revenue`, `formData.wolt_revenue` und `formData.pos_total`
- Nur anzeigen wenn `pos_total > 0` (Division durch Null vermeiden)
