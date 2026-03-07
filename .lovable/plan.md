

## Analyse

Der "Umsatzentwicklung"-Chart (Zeile 479-548 in Statistics.tsx) zeigt aktuell keinen Hinweis darauf, welche Periode gerade dargestellt wird. Das `data`-Objekt aus `useStatistics` liefert bereits `dateRange: { start, end }` zurueck.

## Plan

**Datei: `src/pages/Statistics.tsx`**

Unter dem CardTitle "Umsatzentwicklung" (Zeile 486) einen Untertitel mit dem aktuellen Zeitraum anzeigen:

```tsx
<CardTitle className="flex items-center gap-3">
  <div className="...">
    <TrendingUp className="w-5 h-5 text-primary" />
  </div>
  <div>
    Umsatzentwicklung
    <p className="text-sm font-normal text-muted-foreground mt-0.5">
      {format(data.dateRange.start, 'dd. MMMM yyyy', { locale: de })} – {format(data.dateRange.end, 'dd. MMMM yyyy', { locale: de })}
    </p>
  </div>
</CardTitle>
```

Dies zeigt z.B. "01. März 2026 – 31. März 2026" als Untertitel an. Bei Wechsel der Periode (Woche, Monat, 3 Monate, Benutzerdefiniert) aktualisiert sich der Text automatisch.

