

## Fix: Tooltips werden durch `overflow` des Scroll-Containers verdeckt

### Problem
Die Tooltip-Popups werden innerhalb des `overflow-x-auto overflow-y-auto` Scroll-Containers gerendert und dadurch abgeschnitten.

### Lösung
`TooltipContent` mit `portal`-Rendering und erhöhtem `z-index` versehen. Radix Tooltip rendert standardmäßig bereits in einem Portal, aber der `z-index` muss höher sein als der sticky Header (`z-20`). Außerdem `side="bottom"` setzen um sicherzustellen, dass der Tooltip nach unten öffnet statt nach oben (wo er am oberen Rand des Containers abgeschnitten werden könnte).

### Änderung

**`src/components/zeiterfassung/SfnTooltipHeader.tsx`**:
- `TooltipContent` bekommt `side="bottom"` und `className="z-50"` um über dem sticky Header zu erscheinen
- `avoidCollisions` aktiviert lassen (default)

Das sollte ausreichen, da Radix Tooltip standardmäßig ein Portal nutzt. Falls es trotzdem nicht klappt, liegt es möglicherweise daran, dass der `z-index` des Tooltip-Portals zu niedrig ist — dann wird der `z-50` auf dem Content das beheben.

