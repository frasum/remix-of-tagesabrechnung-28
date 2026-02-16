

## "Kassenbestand" durch "Wechselgeldbestand" ersetzen

Vier Stellen werden angepasst -- ueberall nur das Label, der angezeigte Wert und die Logik bleiben gleich:

### 1. Tagesabrechnung StatCard (`src/pages/DailySummary.tsx`, Zeile 490)
- Label: "Kassenbestand" wird zu "Wechselgeldbestand"

### 2. Excel-Layout (`src/components/daily-summary/layouts/ExcelLayout.tsx`, Zeile 264)
- Label: "Kassenbestand" wird zu "Wechselgeldbestand"

### 3. PDF-Export (`src/utils/pdfExport.ts`, Zeile 215)
- Label: "Kassenbestand" wird zu "Wechselgeldbestand"

### 4. Telegram-Bericht (`supabase/functions/send-telegram-summary/index.ts`, Zeile 135)
- Label: "Kassenbestand" wird zu "Wechselgeldbestand"

### 5. Telegram-Einstellungen (`src/pages/TelegramSettings.tsx`, Zeile 19)
- Label: "Kassenbestand" wird zu "Wechselgeldbestand"

Keine Logik-Aenderungen, keine neuen Abhaengigkeiten. Reine Label-Umbenennung an 5 Stellen.
