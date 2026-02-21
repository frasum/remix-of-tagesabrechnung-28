

## Kontroll-Abschnitt am Ende des PDF-Exports

Am Ende der Tagesabrechnung (PDF) wird ein neuer, grosser Abschnitt hinzugefuegt, der zum Ausschneiden und Ablegen in die Wechselgeldkasse gedacht ist.

### Aufbau

```text
- - - - - - - - - - - - - - - - - - - - - -   (gestrichelte Trennlinie)

         Wechselgeldbestand
            2.150,00 EUR              (sehr grosse Schrift, farblich: gruen ab 2000, rot darunter)

         Abgerechnet von: Max Mustermann
         Datum: Freitag, 21. Februar
```

### Aenderungen

**Datei: `src/utils/pdfExport.ts`**

1. Nach dem letzten Inhalt (Trinkgeld-Aufschluesselung) und vor dem Footer wird ein neuer Abschnitt eingefuegt:
   - Gestrichelte Trennlinie ueber die gesamte Seitenbreite
   - **Wechselgeldbestand** als Ueberschrift (Schriftgroesse ca. 14)
   - **Betrag** in sehr grosser Schrift (Schriftgroesse ca. 24-28), farblich eingefaerbt (gruen ab 2000 EUR, rot darunter)
   - **Name der Person** die die Abrechnung erstellt hat (`createdByName`)
   - **Datum** der Abrechnung

2. Gleichzeitig werden zwei bestehende Fehler im PDF korrigiert:
   - **Tages-Bargeld**: Die Bedingung `previousDeficit < 0` wird entfernt, damit der Wert immer angezeigt wird (analog zur UI-Aenderung)
   - **Wechselgeldbestand-Farbe**: Der Schwellenwert wird von `>= 0` auf `>= 2000` geaendert (analog zur UI-Aenderung)

