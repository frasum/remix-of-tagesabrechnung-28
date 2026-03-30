

# Matching über Personalnummer statt Namensvergleich

## Problem

Der aktuelle Matching-Algorithmus vergleicht Namen fuzzy — das scheitert bei Spitznamen vs. bürgerlichen Namen. Die Personalnummer (`perso_nr`) ist eindeutig und steht sowohl intern als auch auf jeder Lohnabrechnung.

## Änderungen

### 1. Edge Function `parse-payroll-pdf` — Personalnummer mit extrahieren

Den Gemini-Prompt und das Tool-Schema erweitern, damit auch die **Personalnummer** (`perso_nr`) aus jeder Lohnabrechnung extrahiert wird. Das Feld heißt auf deutschen Abrechnungen typischerweise "Personalnummer", "Pers.-Nr." oder "P.-Nr.".

```typescript
// Neues Feld im Tool-Schema:
perso_nr: { type: "number", description: "Personalnummer des Mitarbeiters" }
```

### 2. `ExternalEmployee` Interface erweitern

```typescript
interface ExternalEmployee {
  name: string;
  perso_nr: number | null;  // NEU
  brutto: number | null;
  netto: number | null;
  sfn: number | null;
  auszahlung: number | null;
}
```

### 3. `matchExternal` — Primär über `perso_nr` matchen

Neuer Algorithmus:
1. **Perso-Nr-Match** (exakt) → eindeutig, sofort zuordnen
2. **Name-Fallback** nur für Einträge ohne Perso-Nr-Match (bisherige Logik als Backup)

```typescript
function matchExternal(internal, external) {
  // 1. Pass: Match by perso_nr (exact)
  // 2. Pass: Remaining unmatched → fuzzy name match (existing logic)
}
```

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| `supabase/functions/parse-payroll-pdf/index.ts` | `perso_nr` ins Tool-Schema + Prompt |
| `src/components/zeiterfassung/BatchPayrollCalculation.tsx` | `ExternalEmployee` erweitern, `matchExternal` auf Perso-Nr-first umbauen |

### Ergebnis

Eindeutiges Matching über Personalnummer. Kein Fuzzy-Name-Raten mehr nötig. Fallback auf Namen bleibt für den seltenen Fall, dass die KI keine Personalnummer findet.

