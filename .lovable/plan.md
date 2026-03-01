

## Abteilungs-Checkboxen pro Restaurant im Staff-Dialog

### Änderung

In `src/components/staff/StaffDialogNative.tsx`:

1. **State** von `selectedRestaurants: string[]` auf `restaurantDepts: Record<string, Set<string>>` umstellen (Key = Restaurant-ID, Value = Set von Abteilungen: "Service", "Küche", "GL")

2. **UI**: Pro ausgewähltem Restaurant drei Checkboxen einrücken:
```text
☑ Spicery
    ☑ Service  ☐ Küche  ☐ GL
☑ YUM
    ☐ Service  ☑ Küche  ☐ GL
```

3. **Init**: Beim Bearbeiten bestehende `zt_department`-Werte aus `staff.staff_restaurants` laden. Mehrere Zeilen pro Restaurant werden zu einem Set zusammengeführt.

4. **Submit**: `restaurant_assignments` statt `restaurant_ids` übergeben — pro Restaurant+Abteilung eine eigene Zeile:
```typescript
// z.B. Spicery mit Service+GL → 2 Zeilen
[
  { restaurant_id: "spicery-id", zt_department: "Service" },
  { restaurant_id: "spicery-id", zt_department: "GL" },
  { restaurant_id: "yum-id", zt_department: "Küche" },
]
```

5. **Validierung**: Mindestens eine Abteilung pro ausgewähltem Restaurant erforderlich.

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| `src/components/staff/StaffDialogNative.tsx` | State, UI und Submit-Logik wie oben beschrieben |
| `src/hooks/useRestaurantEmployees.ts` | Deduplizierung hinzufügen, falls ein Mitarbeiter durch mehrere Abteilungs-Zeilen doppelt erscheint |

Die `useStaff.ts` Hooks (`useCreateStaff`, `useUpdateStaff`) unterstützen bereits `restaurant_assignments` mit `zt_department` — dort ist keine Änderung nötig.

