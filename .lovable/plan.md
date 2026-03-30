

# Stundenzahl & Stundenlohn aus Lohnbüro-PDF extrahieren

## Änderungen

### 1. Edge Function `parse-payroll-pdf` — zwei neue Felder im Tool-Schema

Felder `stunden` (Gesamtstunden) und `stundenlohn` (Stundenlohn) zum Gemini-Tool-Schema hinzufügen. Prompt erweitern um Hinweise auf typische Bezeichnungen ("Gesamtstunden", "Std.", "Stundenlohn", "Std.-Lohn").

### 2. `ExternalEmployee` Interface erweitern

```typescript
interface ExternalEmployee {
  name: string;
  perso_nr: number | null;
  brutto: number | null;
  netto: number | null;
  sfn: number | null;
  auszahlung: number | null;
  stunden: number | null;    // NEU
  stundenlohn: number | null; // NEU
}
```

### 3. Vergleichstabelle erweitern

In der Vergleichsansicht zwei neue Spalten "Stunden" und "Stundenlohn" anzeigen, jeweils mit dem Lohnbüro-Wert neben dem eigenen Wert und Delta-Anzeige bei Abweichungen.

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| `supabase/functions/parse-payroll-pdf/index.ts` | `stunden` + `stundenlohn` ins Tool-Schema & Prompt |
| `src/components/zeiterfassung/BatchPayrollCalculation.tsx` | Interface erweitern, Vergleichstabelle um 2 Spalten ergänzen |

