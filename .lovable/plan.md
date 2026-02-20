

# Tages-Rohwert fuer Bargeld anzeigen

## Uebersicht
In der Tagesabrechnung wird eine zusaetzliche Zeile eingefuegt, die den reinen Tages-Bargeldwert (ohne Fehlbetrag Vortag) anzeigt. So ist sofort erkennbar, ob der aktuelle Tag allein plus oder minus war -- unabhaengig von vorherigen Defiziten.

## Darstellung
Direkt oberhalb der bestehenden BARGELD-Zeile erscheint eine neue Zeile:

```text
Gutscheine & Sonstiges
  ...
  Fehlbetrag Vortag              -406,16 EUR
  Ausgaben                        -50,00 EUR
-----------------------------------------------
  Tages-Bargeld                   128,06 EUR   <-- NEU (gruen/rot)
-----------------------------------------------
  BARGELD                        -278,10 EUR   (inkl. Vortag)
  Abschoepfung                      ...
  Wechselgeldbestand                ...
```

- Positive Werte in Gruen, negative in Rot
- Nur anzeigen, wenn ein Fehlbetrag Vortag existiert (sonst sind Tages-Bargeld und BARGELD identisch)

## Technische Details

### Datei: `src/pages/DailySummary.tsx`
- Neuen Wert `bargeldRaw` berechnen: gleiche Formel wie `bargeld`, aber OHNE `previousDeficit`
- `bargeldRaw` als neue Prop an `ExcelLayout` uebergeben

### Datei: `src/components/daily-summary/layouts/ExcelLayout.tsx`
- Neue Prop `bargeldRaw` (optional, number) hinzufuegen
- Neue Zeile "Tages-Bargeld" direkt vor dem bestehenden BARGELD-Block einfuegen
- Nur anzeigen wenn `previousDeficit < 0` (sonst waere der Wert identisch mit BARGELD)
- Farbkodierung: `text-success` bei >= 0, `text-destructive` bei < 0

