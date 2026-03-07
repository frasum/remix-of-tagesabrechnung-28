

# Analyse: Service-MA Spalte vs. Tooltip für 26.02

## Ergebnis

Die **Zahl** und der **Tooltip** sind **konsistent** — beide erfassen sekundäre Kellner korrekt:

Für den 26.02 gibt es 6 primäre `waiter_shifts`-Einträge (Andi, Ann, Coco, Europe, Jasmin, Lam). Lam hat die Rolle `waiter_gl` und wird als GL gefiltert. Tu und Pon sind als sekundäre/zusätzliche Kellner eingetragen. Somit zeigen sowohl die Zahl als auch der Tooltip **7 Mitarbeiter** (Andi, Ann, Coco, Europe, Jasmin, Tu, Pon).

## Noch offenes Problem: Tagesstunden

Die Stunden der sekundären Kellner (Tu, Pon) fehlen in der Tagesansicht, weil deren `staff_id` nicht in `staffIdsOnDate` aufgenommen wird (Zeilen 319–335). Der bereits besprochene Plan, `staffIdsOnDate` um sekundäre Kellner-IDs zu erweitern, behebt dies.

### Änderung in `ZtProvision.tsx`

Im `dailyBreakdown`-Memo bei den sekundären/zusätzlichen Kellnern deren `staff_id` (via `staffNameToId`) zu `staffIdsOnDate` hinzufügen:

```typescript
// Bei second_waiter_name (nach Zeile 322):
const sid = staffNameToId.get(ws.second_waiter_name.toLowerCase());
if (sid) day.staffIdsOnDate.add(sid);

// Bei additional_waiters (nach Zeile 331):
const awSid = staffNameToId.get(aw.toLowerCase());
if (awSid) day.staffIdsOnDate.add(awSid);
```

Damit werden die `zt_shifts`-Stunden aller Service-Mitarbeiter (primär + sekundär) korrekt in die Tagessumme einbezogen.

