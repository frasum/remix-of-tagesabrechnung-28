

## Skills nur bei passender Abteilungszuweisung auswählbar machen

### Mapping: Skill-Kategorie → Abteilung

Die `skills`-Tabelle hat ein `category`-Feld mit den Werten `kitchen`, `service`, `gl`. Diese müssen auf die `zt_department`-Werte gemappt werden:

| Skill-Kategorie | Benötigte Abteilung |
|-----------------|---------------------|
| `kitchen`       | `Küche`             |
| `service`       | `Service`           |
| `gl`            | `GL`                |

### Änderungen in `StaffMatrixView.tsx`

1. **Mapping-Objekt** anlegen: `{ kitchen: 'Küche', service: 'Service', gl: 'GL' }`

2. **Alle zugewiesenen Abteilungen** pro Mitarbeiter sammeln (über alle Restaurants hinweg) — aus dem bestehenden `deptMapByStaff` eine flache `Set<department>` pro Staff ableiten.

3. **Skill-Buttons** deaktivieren, wenn der Mitarbeiter nicht in der passenden Abteilung ist:
   - `disabled` setzen + reduzierte Opacity + Tooltip "Erst Abteilung X zuweisen"
   - Falls der Skill bereits zugewiesen ist aber die Abteilung entfernt wurde: Skill weiterhin anzeigen, aber visuell als Warnung markieren

### Auswirkung

Nur in der Matrix-Ansicht. Der Dienstplan filtert bereits automatisch nach `employeeSkillIds`, d.h. wenn ein Skill nicht zugewiesen werden kann, taucht er auch im Dienstplan nicht auf.

