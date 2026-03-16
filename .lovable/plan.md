

## Problem: Dienstplan-Tabelle wird abgeschnitten

Die Tabelle hat ~30 Spalten mit je `min-w-[52px]`, was ca. 1700px ergibt. Der Container mit `overflow-x-auto` funktioniert nicht korrekt, weil die übergeordneten Elemente keine Breitenbegrenzung haben (`min-w-0` fehlt). Dadurch dehnt sich die Tabelle über den Viewport hinaus aus, ohne dass ein Scrollbalken erscheint.

### Änderung

**`src/components/dienstplan/MonthlyGrid.tsx`**
- Den äußeren Container von `<div className="overflow-x-auto border rounded-lg">` auf `<div className="overflow-x-auto border rounded-lg min-w-0 max-w-full">` ändern

**`src/pages/DienstplanLayout.tsx`**
- Dem Content-Container `min-w-0 overflow-hidden` hinzufügen, damit die Kinder korrekt beschränkt werden:
  `<div className="space-y-4 min-w-0 overflow-hidden">`

### Technischer Hintergrund
In CSS-Layouts (Flex/Grid) haben Kinder standardmäßig `min-width: auto`, was bedeutet, dass sie sich nicht kleiner als ihren Inhalt machen lassen. Durch `min-w-0` wird diese Beschränkung aufgehoben und `overflow-x-auto` kann korrekt greifen.

