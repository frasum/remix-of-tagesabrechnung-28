

## Plan: "+"-Button sofort aktivieren wenn Beschreibung + Betrag ausgefüllt

### Analyse
Die Bedingung `disabled={!expenseDescription.trim() || expenseAmount <= 0}` ist bereits korrekt implementiert. Das Problem: `CurrencyInput` ruft `onChange` erst bei `onBlur` auf — solange man tippt, bleibt `expenseAmount` auf 0, und der Button bleibt deaktiviert.

### Umsetzung

**Datei: `src/components/shared/CurrencyInput.tsx`**
- In `handleChange` zusätzlich `onChange` mit dem geparsten Wert aufrufen, damit der Parent-State sofort aktualisiert wird (nicht erst bei Blur).

```typescript
const handleChange = (e) => {
  const rawValue = e.target.value.replace(/[^0-9.,]/g, '');
  setDisplayValue(rawValue);
  // Sofort den Wert an Parent melden
  const numValue = parseFloat(rawValue.replace(',', '.')) || 0;
  onChange(numValue);
};
```

Betrifft eine Stelle in einer Datei. Die Formatierung (z.B. "5" → "5,00") passiert weiterhin erst bei Blur.

