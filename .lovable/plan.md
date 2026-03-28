

# Badge für Mitarbeiter mit Küche + Service im Lohnportal

## Was passiert

Mitarbeiter, die sowohl in der Küche als auch im Service Schichten haben, bekommen ein kleines Badge (z.B. "K+S") neben ihrem Namen — sowohl in der Zusammenfassung als auch in der Buchhaltung des Lohnbüro-Portals. So wird sofort sichtbar, dass bei der Abrechnung Stunden aus beiden Abteilungen zusammengerechnet werden müssen.

## Umsetzung

### Datei: `src/pages/shared/PayrollPortal.tsx`

1. **Dual-Department-Set berechnen** — ein `useMemo` in `PayrollPortal`, das alle `employees` durchgeht und prüft, welche `employee.id` in mehr als einer Abteilung vorkommt (also mindestens einmal Küche UND einmal Service). Das Ergebnis ist ein `Set<string>` mit den IDs dieser Mitarbeiter.

2. **Set als Prop durchreichen** an `PayrollZusammenfassungTab` und `PayrollBuchhaltungTab`.

3. **Badge rendern** — in beiden Tabs: neben dem Mitarbeiternamen ein kleines `<Badge>` mit Text "K+S" anzeigen, wenn die ID im Set enthalten ist. Styling: auffällig aber dezent, z.B. `bg-amber-100 text-amber-800 border-amber-300`.

4. **Buchhaltung via BuchhaltungRow** — Da die Buchhaltung `BuchhaltungRow` nutzt, wird dort entweder ein neues Prop `isDualDepartment` hinzugefügt, oder das Badge direkt im PayrollBuchhaltungTab vor/nach der Row gerendert. Einfacher: neues optionales Prop `isDualDepartment` an `BuchhaltungRow` → zeigt Badge neben dem Namen.

### Betroffene Dateien
- `src/pages/shared/PayrollPortal.tsx` (Set berechnen, Props, Zusammenfassung-Badge)
- `src/pages/zeiterfassung/buchhaltung/BuchhaltungRow.tsx` (optionales `isDualDepartment`-Prop → Badge)

