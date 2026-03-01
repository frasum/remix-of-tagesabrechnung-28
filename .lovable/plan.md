

## ShiftTimeOverride immer fuer alle Restaurants anzeigen

Das Problem: Die ShiftTimeOverride-Komponente zeigt aktuell nur Mitarbeiter des ausgewaehlten Restaurants. Der User moechte, dass sie immer Mitarbeiter **beider** Restaurants anzeigt, unabhaengig von der Sidebar-Auswahl.

### Aenderung in `src/pages/zeiterfassung/ZtZusammenfassung.tsx`

1. **`useRestaurants` importieren** und alle Restaurant-IDs ermitteln.

2. **Neuen Query hinzufuegen**, der Mitarbeiter aller Restaurants laedt (analog zu `useRestaurantEmployees`, aber ohne Restaurant-Filter):
   ```ts
   const { data: allRestaurantEmployees } = useQuery({
     queryKey: ["all-restaurant-employees-zt", allRestaurantIds],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("staff_restaurants")
         .select("zt_department, staff_id, restaurant_id, staff!inner(id, name, perso_nr, first_name, last_name, nickname)")
         .in("restaurant_id", allRestaurantIds)
         .not("zt_department", "is", null);
       if (error) throw error;
       return data.map(row => ({ ... }));
     },
   });
   ```

3. **Alle Wochen-IDs aller Restaurants fuer die selbe Periode laden**, damit ShiftTimeOverride die Schichten aller Restaurants abdecken kann. Dazu einen Query der `zt_weeks` nach Datumsbereichen (nicht nach Restaurant) laedt.

4. **ShiftTimeOverride-Props anpassen**: Statt `sortedEmployees` und `employeesWithShifts` (die nur das aktuelle Restaurant betreffen) werden die neuen restaurantuebergreifenden Daten uebergeben. Die Filter-Logik (Peter, Schumann/Chefin) bleibt gleich, wird aber auf die erweiterte Mitarbeiterliste angewandt.

5. **weekIds fuer ShiftTimeOverride**: Alle Wochen-IDs aller Restaurants der selben Periode uebergeben, damit Schichten korrekt erzeugt/ueberschrieben werden.

### Aenderung in `src/components/zeiterfassung/ShiftTimeOverride.tsx`

Keine strukturelle Aenderung noetig – die Komponente nimmt bereits generische Listen entgegen. Die breitere Datenbasis kommt rein ueber die Props.

