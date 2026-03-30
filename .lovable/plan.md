

# Batch-Berechnungen speichern & löschen

## Konzept

Eine neue Tabelle `payroll_calculations` speichert die Ergebnisse einer Batch-Berechnung als Snapshot. Der Nutzer kann nach einer Berechnung auf „Speichern" klicken und später gespeicherte Berechnungen laden oder löschen.

## Änderungen

### 1. DB-Migration — neue Tabelle `payroll_calculations`

```sql
CREATE TABLE public.payroll_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id uuid NOT NULL,
  sfn_mode text NOT NULL DEFAULT 'simple',
  date_from date NOT NULL,
  date_to date NOT NULL,
  label text,                          -- z.B. "März 2026"
  results jsonb NOT NULL DEFAULT '[]', -- Array der BatchResult-Objekte
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by_name text
);

ALTER TABLE public.payroll_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow payroll_calculations access via app"
  ON public.payroll_calculations FOR ALL USING (true) WITH CHECK (true);
```

### 2. UI-Erweiterungen in `BatchPayrollCalculation.tsx`

- **Nach Berechnung**: Neuer Button „Berechnung speichern" (Save-Icon) → speichert die `batchResults` als JSON in `payroll_calculations` mit Perioden-Label, Datum und SFN-Modus.
- **Dropdown „Gespeicherte Berechnungen"**: Lädt alle gespeicherten Berechnungen für die aktuelle Periode. Beim Auswählen werden die Ergebnisse aus dem JSON geladen und angezeigt (ohne Neuberechnung).
- **Löschen-Button**: Neben jeder gespeicherten Berechnung ein Trash-Icon → löscht den Eintrag nach Bestätigung.

### 3. Ablauf

```text
┌─────────────────────────┐
│  Batch berechnen        │
│  [Alle berechnen]       │
└──────┬──────────────────┘
       │ Ergebnisse vorhanden
       ▼
┌─────────────────────────┐
│  [💾 Speichern]  [📥 Excel] │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Gespeicherte:          │
│  ● März 2026 (30.03.)  🗑│
│  ● März 2026 (28.03.)  🗑│
└─────────────────────────┘
```

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| Migration | Neue Tabelle `payroll_calculations` |
| `src/components/zeiterfassung/BatchPayrollCalculation.tsx` | Speichern-Button, Laden-Dropdown, Löschen-Button + Queries |

### Props-Erweiterung

`BatchPayrollCalculation` erhält zusätzlich `periodId` und `periodLabel` aus `ZtBruttoNetto.tsx`, damit der Snapshot der richtigen Periode zugeordnet wird.

