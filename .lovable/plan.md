

## Scrollbar dauerhaft sichtbar machen

Eine CSS-Klasse auf den `overflow-x-auto`-Container in `MonthlyGrid.tsx` anwenden, die die Scrollbar immer anzeigt.

### Änderung

**`src/index.css`** — Neue Utility-Klasse hinzufügen:
```css
.scrollbar-always-visible {
  overflow-x: scroll !important;
}
.scrollbar-always-visible::-webkit-scrollbar {
  height: 8px;
  display: block;
}
.scrollbar-always-visible::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 4px;
}
.scrollbar-always-visible::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 4px;
}
.scrollbar-always-visible::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}
```

**`src/components/dienstplan/MonthlyGrid.tsx`** — Die Klasse `scrollbar-always-visible` zum äußeren Container hinzufügen (ersetzt `overflow-x-auto`).

