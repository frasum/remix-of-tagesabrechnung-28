

## Plan: Settlement-Webhook auch bei Drucken auslösen

### Ansatz
Die `PdfPreview`-Komponente erhält einen optionalen `onPrint`-Callback. In `DailySummary.tsx` wird dieser Callback genutzt, um die Settlement-Logik (und Telegram-Benachrichtigung) auch beim Drucken auszulösen.

### Änderungen

**1. `src/components/shared/PdfPreview.tsx`**
- Neue optionale Prop `onPrint?: () => void` hinzufügen
- Im bestehenden `handlePrint` nach dem Druckaufruf `onPrint?.()` aufrufen

**2. `src/pages/DailySummary.tsx`**
- Settlement-Webhook-Logik in eine eigene Funktion `triggerSettlement` extrahieren
- `handleDownloadPdf` ruft `triggerSettlement()` auf
- Neuen `handlePrintPdf`-Callback erstellen, der ebenfalls `triggerSettlement()` aufruft
- `onPrint={handlePrintPdf}` an die `PdfPreview`-Komponente übergeben

