

## History-Tabelle übersichtlicher gestalten

### Änderungen in `src/pages/History.tsx`

**1. Jahreszahl entfernen**
Datumsformat von `"EEEE, d. MMM yyyy"` → `"EEEE, d. MMM"` ändern (z.B. "Freitag, 6. März" statt "Freitag, 6. März 2026"). Spart Platz und vermeidet Zeilenumbrüche in der Datum-Spalte.

**2. Spaltenbreiten optimieren**
- Datum schmaler (`w-[160px]`), da Jahreszahl wegfällt
- Restliche Spalten gleichmäßiger verteilen mit relativen Breiten statt fixen Pixelwerten

**3. Kompaktere Darstellung der Prozent-Spalten**
Kreditkarten und Take Away: Betrag und Prozent in einer Zeile statt untereinander, z.B. `3.606 € (79.6%)` — wie es teilweise schon der Fall ist, aber konsistent machen.

**4. Zeilenabstand reduzieren**
`TableCell` mit `py-2` statt Standard-Padding für kompaktere Zeilen.

**Vorher → Nachher Beispiel:**
```text
Vorher:  Freitag, 6. März 2026    5.952,50 €    5.606,47 €
                                                  (94.2%)

Nachher: Freitag, 6. März         5.952,50 €    5.606,47 € (94.2%)
```

Nur `src/pages/History.tsx` betroffen — eine Datei, reine Darstellungsänderung.

