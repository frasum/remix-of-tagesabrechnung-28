

# Lohnbüro-PDF: Keine Daten werden extrahiert

## Problem

Die Lohnbüro-PDFs werden wahrscheinlich als gescannte Bilder (nicht als Text-PDFs) generiert. Das aktuelle System sendet das PDF direkt an Gemini, aber das `file`-Format funktioniert möglicherweise nicht zuverlässig für die Datenextraktion. Außerdem könnte das Ergebnis leer zurückkommen, ohne dass der Nutzer eine Fehlermeldung sieht.

## Änderungen

### 1. Edge Function `parse-payroll-pdf` verbessern

**Problem 1 — Content-Format**: Das `file`-Format mit `file_data` ist möglicherweise nicht optimal. Stattdessen `inline_data` im `parts`-Array verwenden, was zuverlässiger für PDF-Dokumente funktioniert.

**Problem 2 — Leeres Ergebnis**: Wenn die KI keine Mitarbeiter extrahiert, wird trotzdem ein leeres Array gespeichert. Der Nutzer sieht keine Fehlermeldung.

**Problem 3 — Debugging**: Kein Logging, was die KI tatsächlich zurückgibt.

Konkrete Änderungen:
- PDF als `inline_data` (mit `mime_type: "application/pdf"`) statt als `file`-Typ senden
- Logging hinzufügen: Anzahl extrahierter Mitarbeiter und ggf. raw response bei leerem Ergebnis
- Wenn 0 Mitarbeiter extrahiert werden: Fehler zurückgeben statt leeres Array zu speichern
- Fallback: Wenn Tool-Call leer ist, versuchen den `content`-Text der Antwort zu parsen

### 2. Frontend — Fehlermeldung bei leerem Ergebnis

In `BatchPayrollCalculation.tsx`: Wenn die Edge Function 0 Mitarbeiter zurückgibt, eine Toast-Warnung anzeigen ("Keine Mitarbeiter im PDF erkannt").

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| `supabase/functions/parse-payroll-pdf/index.ts` | `inline_data` statt `file`, Logging, Fehler bei leerem Ergebnis |
| `src/components/zeiterfassung/BatchPayrollCalculation.tsx` | Toast-Warnung bei 0 extrahierten Mitarbeitern |

### Technische Details

```text
Vorher:
  content: [{ type: "file", file: { filename: "...", file_data: "data:application/pdf;base64,..." } }]

Nachher:
  content: [{ type: "text", text: "Extrahiere..." }, { type: "image_url", image_url: { url: "data:application/pdf;base64,..." } }]
```

Das `image_url`-Format mit `data:application/pdf;base64,...` ist das in der Lovable AI Gateway Dokumentation empfohlene Format für Dokument-Analyse und funktioniert sowohl für Text- als auch für gescannte PDFs.

