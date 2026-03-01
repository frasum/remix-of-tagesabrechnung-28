

## Plan: Tägliche Schichterzeugung für "Chefin" (nur Restaurant Yum)

### Änderungen

**1. `src/components/zeiterfassung/ShiftTimeOverride.tsx`**
- Neue optionale Prop `dailyEmployees` (Mitarbeiter für tägliche Mo–So Schichterzeugung)
- Dritter UI-Abschnitt: **"Tägliche Schichten erzeugen (Mo–So)"**
- Logik: Für jeden Tag jeder Woche der Periode → `upsert` mit 17:00–01:00 (alle Tage, keine Ausnahmen)
- Stunden über `calculateShiftHours()` berechnen, dabei Sonn-/Feiertage korrekt als `is_holiday` markieren

**2. `src/pages/zeiterfassung/ZtZusammenfassung.tsx`**
- `restaurantSlug` aus `useRestaurant()` holen
- Neue Prop `dailyEmployees` an `ShiftTimeOverride` übergeben, nur befüllt wenn `restaurantSlug === "yum"`:

```typescript
dailyEmployees={restaurantSlug === "yum"
  ? sortedEmployees.filter(e =>
      [e.name, e.last_name].some(n => n?.toLowerCase().includes("schumann")) ||
      e.nickname?.toLowerCase().includes("chefin")
    )
  : []
}
```

