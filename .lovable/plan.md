

## Problem

Die Duplikate entstehen, weil verschiedene Schichten denselben Mitarbeiter mit unterschiedlicher Schreibweise speichern (z.B. "Pongsri" vs "PONGSRI", "Bun" vs "BUN", "Tu" vs "TU"). Obwohl die aktuelle Key-Logik theoretisch korrekt normalisiert, gibt es Randfälle, die zu getrennten Einträgen führen können.

## Lösung: Post-Processing Deduplizierung

Anstatt sich ausschließlich auf die Key-Generierung zu verlassen, wird ein **Deduplizierungs-Schritt** nach dem Aufbau der Maps hinzugefügt. Dieser mergt alle Einträge mit demselben normalisierten Namen.

### Änderung in `src/hooks/useMonthlyStaffTips.ts`

**Neue Hilfsfunktion** zum Zusammenführen von Einträgen mit gleichem normalisierten Namen:

```typescript
function deduplicateByName(
  entries: { name: string; tip: number; hours: number }[],
  staffNames: Record<string, string> // normalized → canonical display name
): { name: string; tip: number; hours: number }[] {
  const merged: Record<string, { name: string; tip: number; hours: number }> = {};
  for (const entry of entries) {
    const key = entry.name.toLowerCase().trim();
    if (!merged[key]) {
      // Use canonical staff name if available, otherwise first encountered
      merged[key] = { 
        name: staffNames[key] || entry.name, 
        tip: 0, hours: 0 
      };
    }
    merged[key].tip += entry.tip;
    merged[key].hours += entry.hours;
  }
  return Object.values(merged).sort((a, b) => b.tip - a.tip);
}
```

**Anwendung** nach dem Aufbau von `waiterTips` und `kitchenTips` (vor dem Push in `monthsData`):

- `staffNames`-Map aus der Staff-Tabelle aufbauen: `{ "pongsri": "PONGSRI", "bun": "BUN", ... }`
- Beide Arrays durch `deduplicateByName()` laufen lassen
- Ergebnis: Alle Namensvarianten werden zusammengeführt, kanonischer Name aus Staff-Tabelle verwendet

Dies ist ein robuster Sicherheitsmechanismus, der unabhängig von der Key-Generierung funktioniert und alle Casing-Varianten zuverlässig zusammenführt.

