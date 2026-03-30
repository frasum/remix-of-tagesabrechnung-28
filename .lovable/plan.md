

# Lohnbüro-PDF hochladen & automatisch vergleichen

## Konzept

Bei jeder gespeicherten Batch-Berechnung kann ein PDF vom Lohnbüro hochgeladen werden. Das PDF enthält einzelne Lohnabrechnungen pro Mitarbeiter. Eine Edge Function nutzt KI (Gemini), um die relevanten Werte (Name, Brutto, Netto, SFN-Zuschläge, Auszahlung) aus jeder Seite zu extrahieren. Die extrahierten Werte werden mit der eigenen Berechnung verglichen und Abweichungen farblich markiert.

## Änderungen

### 1. Storage-Bucket `payroll-pdfs`

Migration erstellt einen öffentlichen Bucket für die hochgeladenen Lohnbüro-PDFs + RLS-Policies.

### 2. DB-Migration — neue Spalten in `payroll_calculations`

```sql
ALTER TABLE public.payroll_calculations
  ADD COLUMN pdf_path text,              -- Storage-Pfad des hochgeladenen PDFs
  ADD COLUMN external_results jsonb;     -- KI-extrahierte Werte [{name, brutto, netto, sfn, auszahlung}, ...]
```

### 3. Neue Edge Function `parse-payroll-pdf`

- Empfängt die `calculationId` und den Storage-Pfad
- Lädt das PDF aus dem Bucket
- Sendet es an Gemini (via Lovable AI) mit einem strukturierten Prompt:
  *"Extrahiere aus jeder Lohnabrechnung: Mitarbeitername, Brutto-Gehalt, Netto-Gehalt, steuerfreie SFN-Zuschläge, Auszahlungsbetrag. Antworte als JSON-Array."*
- Speichert das Ergebnis in `payroll_calculations.external_results`
- Gibt die extrahierten Daten zurück

### 4. UI-Erweiterungen in `BatchPayrollCalculation.tsx`

- **Upload-Button** (📎) neben jeder gespeicherten Berechnung → öffnet File-Input für PDF
- **Status-Anzeige**: Während KI parst → Spinner; danach → grünes Häkchen
- **Vergleichsansicht**: Wenn `external_results` vorhanden, wird pro Mitarbeiter eine zusätzliche Zeile/Spalte angezeigt:
  - Eigener Wert vs. Lohnbüro-Wert
  - Abweichungen > 1 € werden rot markiert
  - Übereinstimmungen grün
- **Matching**: Mitarbeiter werden per Namensähnlichkeit (Levenshtein oder normalisierter Vergleich) zugeordnet, nicht zugeordnete Einträge werden separat aufgelistet

### 5. Ablauf

```text
┌───────────────────────────────────────┐
│  Gespeicherte Berechnungen            │
│  ● März 2026 (30.03.)  📎 🗑          │
│                         ↑             │
│                    PDF hochladen      │
└──────┬────────────────────────────────┘
       │ Upload + KI-Parsing
       ▼
┌───────────────────────────────────────┐
│  Vergleich: Eigene vs. Lohnbüro      │
│                                       │
│  Name      │ Eigen │ Lohnb. │ Diff   │
│  ──────────┼───────┼────────┼──────  │
│  Max M.    │ 2.450 │ 2.450  │  ✓     │
│  Lisa K.   │ 1.890 │ 1.920  │ -30 ⚠ │
│  ...       │       │        │        │
└───────────────────────────────────────┘
```

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| Migration | Bucket + 2 neue Spalten |
| `supabase/functions/parse-payroll-pdf/index.ts` | **NEU** — KI-gestütztes PDF-Parsing |
| `src/components/zeiterfassung/BatchPayrollCalculation.tsx` | Upload-Button, Vergleichsansicht |

### Technische Details

- **KI-Modell**: `google/gemini-2.5-flash` (gut für Dokument-Analyse, schnell, kostengünstig)
- **PDF → Base64**: Die Edge Function liest das PDF aus Storage und sendet es als Base64-encoded Image/Document an Gemini
- **Matching-Logik**: Normalisierter Name-Vergleich (lowercase, trim, Umlaute) + optionaler Perso-Nr-Match
- **Fehlerbehandlung**: Wenn KI einen Mitarbeiter nicht zuordnen kann, wird er unter "Nicht zugeordnet" gelistet

