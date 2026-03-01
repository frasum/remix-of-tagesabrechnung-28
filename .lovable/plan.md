

## Auto-Scroll zum heutigen Tag im Wochenplan

### Änderungen

| Datei | Änderung |
|---|---|
| `src/pages/zeiterfassung/ZtWochenplan.tsx` | 1. `useRef` für den scrollbaren Container (`div.overflow-x-auto`) hinzufügen. 2. Dem heutigen Tag-Header ein `data-today`-Attribut oder eine Ref zuweisen. 3. Per `useEffect` nach dem Rendern der Tabelle zum heutigen Tag scrollen (`scrollIntoView` oder `scrollLeft` berechnen), damit die aktuelle Tagesspalte sichtbar ist. |

### Detail
- `useRef<HTMLDivElement>` auf den äußeren `<div className="overflow-x-auto ...">` setzen
- Dem `<th>` des heutigen Tages ein `ref` oder `data-date={dateStr}` geben
- `useEffect` mit Abhängigkeit auf `selectedWeekId` und `weekDays`: nach Render das Element mit dem heutigen Datum per `querySelector` finden und `scrollIntoView({ inline: "center", behavior: "smooth" })` aufrufen
- Nur scrollen wenn der heutige Tag in der aktuellen Woche enthalten ist

