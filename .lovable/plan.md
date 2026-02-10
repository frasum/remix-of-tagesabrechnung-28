

# Kassenbestand in Tagesabrechnung und PDF anzeigen

## Berechnung

```text
Kassenbestand = Wechselgeld + Summe(Bargeld aller Tage bis einschliesslich ausgewaehltem Datum)
```

Bankeinzahlungen werden NICHT abgezogen.

## Aenderungen

### 1. Neuer Hook: `src/hooks/useRemainingCash.ts`
- Nutzt `useCashBalanceData` und `usePettyCash` (beides vorhanden)
- Filtert die Tages-Zeilen bis zum ausgewaehlten Datum
- Summiert das Bargeld und addiert das Wechselgeld
- Gibt `{ remainingCash, isLoading }` zurueck

### 2. DailySummary.tsx
- `useRemainingCash` Hook einbinden
- Neue StatCard unterhalb der Bargeld-Karte:
  - Label: "Kassenbestand"
  - Icon: Wallet
  - Wert: formatierter Betrag (gruen wenn positiv, rot wenn negativ)
- Den Wert an `generateDailySummaryPDF` weitergeben

### 3. pdfExport.ts
- Neues optionales Feld `remainingCash?: number` im `PDFExportData`-Interface
- Nach der "ohne hilfmahl"-Zeile eine neue hervorgehobene Zeile:
  - **"Kassenbestand"** mit dem Betrag
  - Hintergrundfarbe: gruen bei positivem Wert, rot bei negativem

## Technische Details
- Keine neuen DB-Abfragen -- alles basiert auf vorhandenen Hooks
- `useCashBalanceData` laedt bereits alle Sessions fuer das Restaurant
- `usePettyCash` laedt das Wechselgeld aus der settings-Tabelle
- Der Hook filtert nur nach Datum und summiert
