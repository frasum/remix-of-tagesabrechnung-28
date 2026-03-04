

## Plan: Stundenlohn-Autofill reparieren

### Problem
Der Stundenlohn wird beim Mitarbeiterwechsel nicht angezeigt, weil `useMemo` für State-Updates (`setState`) verwendet wird. `useMemo` ist für berechnete Werte gedacht, nicht für Side-Effects — React garantiert nicht, dass der Callback zuverlässig ausgeführt wird.

### Lösung

**Datei: `src/pages/zeiterfassung/ZtBruttoNetto.tsx`**

`useMemo` (Zeile 93) durch `useEffect` ersetzen:

```typescript
useEffect(() => {
  if (staffDetails) {
    if (staffDetails.tax_class) setTaxClass(staffDetails.tax_class);
    if (effectiveHourlyRate) setHourlyRate(String(effectiveHourlyRate));
    if (staffDetails.health_insurance) {
      setInsuranceType(staffDetails.health_insurance === "privat" ? "privat" : "gesetzlich");
    }
  }
}, [staffDetails, effectiveHourlyRate]);
```

Einzeilige Änderung — `useMemo` → `useEffect`. Keine weiteren Anpassungen nötig.

