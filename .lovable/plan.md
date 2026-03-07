

# Provision nur bei Service-Schichten anzeigen

## Problem
Mitarbeiter wie Lahm und Mo, die sowohl in Service als auch GL arbeiten, bekommen die Provision aktuell in **beiden** Abteilungszeilen angezeigt. Die Provision soll nur bei der Service-Zeile erscheinen.

## Lösung
An allen Stellen, wo `commissionMap.get(emp.id)` verwendet wird, eine Abteilungsprüfung hinzufügen: Provision nur wenn `emp.department === "Service"`.

## Änderungen

### `src/pages/zeiterfassung/ZtBuchhaltung.tsx` (Zeile 238)
```
commission={emp.department === "Service" ? (commissionMap.get(emp.id) ?? 0) : 0}
```

### `src/pages/shared/PayrollPortal.tsx` (Zeile 1103 + Zeile 1050)
- Row: `commission={emp.department === "Service" ? (commissionMap?.get(emp.id) ?? 0) : 0}`
- Summe: Nur Service-Mitarbeiter summieren

### `src/lib/exportBuchhaltungPdf.ts` (Zeile 138)
```
const commission = emp.department === "Service" ? (commissionMap?.get(emp.id) ?? 0) : 0;
```

### `src/lib/exportBuchhaltungExcel.ts` (Zeile 122)
```
const commission = emp.department === "Service" ? (commissionMap?.get(emp.id) ?? 0) : 0;
```

### `src/lib/exportCsv.ts` (Zeile 152)
```
const commission = emp.department === "Service" ? (commissionMap?.get(emp.id) ?? 0) : 0;
```

Insgesamt 5 Dateien, jeweils eine einzeilige Änderung.

