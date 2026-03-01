

## Browser-Titel fuer Lohnbuero aendern

Der Titel "Spicery Kellner" kommt aus der `index.html` und gilt global. Fuer das Lohnbuero-Portal wird er dynamisch ueberschrieben.

### Aenderung in `src/pages/shared/PayrollPortal.tsx`

Ein `useEffect` wird hinzugefuegt, der beim Laden der Seite den Browser-Titel auf **"YUM Gastronomie GmbH Arbeitszeiterfassung"** setzt und beim Verlassen den urspruenglichen Titel wiederherstellt:

```tsx
useEffect(() => {
  const prev = document.title;
  document.title = 'YUM Gastronomie GmbH Arbeitszeiterfassung';
  return () => { document.title = prev; };
}, []);
```

Zusaetzlich wird das Favicon fuer diese Seite nicht geaendert — der Titel allein genuegt laut Anfrage.

