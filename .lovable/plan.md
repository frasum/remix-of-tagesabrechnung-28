

## Fix: Session-Erstellung bei Kellner-Selfservice absichern

### Problem

Wenn Mo auf "Abrechnung speichern" klickt, prueft der Code ob eine Session existiert. Wenn die Session-Abfrage noch nicht geladen hat oder ein Timing-Problem vorliegt, versucht der Code eine neue Session anzulegen. Da aber bereits eine Session fuer heute existiert (vom Manager erstellt), schlaegt das an der Datenbank-Einschraenkung `sessions_restaurant_date_unique` fehl.

Die DB-Logs zeigen 6 solcher Fehler in den letzten Minuten.

### Loesung

Die `useCreateSession`-Funktion so aendern, dass sie **zuerst prueft ob eine Session existiert** und diese zurueckgibt, anstatt blind ein INSERT zu machen. Das ist ein "upsert"-artiges Verhalten.

### Aenderungen

**1. `src/hooks/useSession.ts` -- `useCreateSession` absichern**

Die `mutationFn` aendern: Vor dem INSERT erst ein SELECT machen. Falls die Session schon existiert, diese zurueckgeben statt eine neue zu erstellen.

```text
mutationFn: async ({ date, restaurantId, createdByName }) => {
  const dateStr = format(date, 'yyyy-MM-dd');

  // Erst pruefen ob Session schon existiert
  const { data: existing } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_date', dateStr)
    .eq('restaurant_id', restaurantId)
    .maybeSingle();

  if (existing) return existing;

  // Nur erstellen wenn keine existiert
  const { data, error } = await supabase
    .from('sessions')
    .insert({ ... })
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

**2. `src/pages/WaiterMobile.tsx` -- Zusaetzliche Absicherung**

Den Save-Button deaktivieren solange die Session-Query noch laedt (`sessionLoading`), damit der Benutzer nicht zu frueh klicken kann.

### Ergebnis

- Kein "duplicate key" Fehler mehr
- Mo und andere Kellner koennen problemlos speichern, auch wenn die Session bereits vom Manager erstellt wurde
- Keine Aenderung am bestehenden Verhalten fuer Manager

