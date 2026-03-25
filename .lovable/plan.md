

## Fix: Provisions-Tab im Lohnbüro nicht sichtbar

### Analyse

Der Code ist vollständig vorhanden — sowohl die Edge Function (`payroll-office-data`) als auch die UI (`PayrollProvisionTab` + 4. Tab) sind korrekt implementiert. Das Problem ist höchstwahrscheinlich, dass die Edge Function nach dem letzten Update **nicht neu deployed** wurde. Die alte deployed Version liefert daher `waiterShifts`, `staffRoles` und `commissionSettings` nicht in der Response zurück.

### Lösung

Die Edge Function `payroll-office-data` muss neu deployed werden. Keine Code-Änderungen nötig — nur ein Redeployment.

