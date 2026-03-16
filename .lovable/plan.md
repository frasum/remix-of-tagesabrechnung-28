

## Mehrfach-Abteilungen pro Restaurant in der Matrix-Ansicht

### Problem

Die Datenbank unterstützt bereits mehrere Abteilungen pro Mitarbeiter+Restaurant (eine Zeile pro Abteilung in `staff_restaurants`). Allerdings zeigt die Matrix-Ansicht aktuell nur ein einzelnes Dropdown pro Restaurant — das kann nur eine Abteilung darstellen.

### Lösung

Pro Restaurant-Spalte statt eines Dropdowns **drei Checkboxen** (Service, Küche, GL) anzeigen. Jede Checkbox toggelt eine eigene `staff_restaurants`-Zeile.

```text
┌────────────┬──────────┬─────────────────────┬─────────────────────┐
│ Name       │ Berech.  │ YUM                 │ SIAM                │
├────────────┼──────────┼─────────────────────┼─────────────────────┤
│ MO         │ [Admin▾] │ ☑ Service           │ ☑ Service           │
│            │          │ ☑ Küche             │ ☐ Küche             │
│            │          │ ☐ GL                │ ☑ GL                │
├────────────┼──────────┼─────────────────────┼─────────────────────┤
│ FERN       │ [Staff▾] │ ☐ Service           │ ...                 │
│            │          │ ☑ Küche             │                     │
│            │          │ ☐ GL                │                     │
└────────────┴──────────┴─────────────────────┴─────────────────────┘
```

### Änderungen

**`StaffMatrixView.tsx`**: 
- Statt `assignedRestaurants` als `Set<restaurant_id>` → eine `Map<restaurant_id, Set<department>>` bauen
- Pro Restaurant-Zelle: 3 Checkboxen für Service/Küche/GL statt eines übergeordneten Checkbox + Dropdown
- Toggle-Logik: Checkbox an = `INSERT` in `staff_restaurants` mit `zt_department`; Checkbox aus = `DELETE` der entsprechenden Zeile
- Die alte `handleRestaurantToggle` und `handleDeptChange` werden durch eine einzige `handleDeptToggle(staffId, restaurantId, department, isCurrentlyAssigned)` ersetzt

Keine DB-Schema-Änderungen nötig — das Multi-Row-Muster existiert bereits.

