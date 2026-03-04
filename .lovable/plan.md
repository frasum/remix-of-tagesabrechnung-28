

## Plan: Tooltips mit Zuschlagsprozenten auf Spaltenüberschriften

Auf den Spaltenüberschriften **So/Fei**, **20–24** und **24–x** in allen relevanten Tabellen Tooltips hinzufügen, die den jeweiligen SFN-Zuschlagsprozentsatz anzeigen.

### Tooltips

| Spalte | Tooltip-Text |
|--------|-------------|
| So/Fei | 50% Sonntagszuschlag · 125% Feiertagszuschlag |
| 20–24  | 25% Nachtzuschlag |
| 24–x   | 40% Nachtzuschlag |

### Betroffene Dateien

1. **`src/pages/zeiterfassung/buchhaltung/BuchhaltungTableHead.tsx`** — Buchhaltungsansicht
2. **`src/pages/zeiterfassung/ZtWochenplan.tsx`** — Wochenplan-Tabelle
3. **`src/pages/zeiterfassung/ZtZusammenfassung.tsx`** — Zusammenfassung
4. **`src/pages/shared/SharedZtView.tsx`** — Geteilte Ansicht
5. **`src/pages/shared/PayrollPortal.tsx`** — Lohnbüro-Portal

Jede `<th>` wird in eine `<Tooltip>` (aus `@radix-ui/react-tooltip`, bereits vorhanden) gewrappt. Die Tooltips nutzen den bestehenden `TooltipProvider` / `Tooltip` / `TooltipTrigger` / `TooltipContent` aus `src/components/ui/tooltip.tsx`.

