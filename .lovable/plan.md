

## Plan: Abteilungs-Header im Sharelink-Wochenplan

Der Wochenplan in der SharedZtView zeigt aktuell alle Mitarbeiter in einer flachen Liste ohne Gruppierung. Im Hauptmodul (`ZtWochenplan`) werden sie nach Abteilung (Küche, GL, Service) gruppiert mit farbigen Header-Zeilen.

### Änderung in `src/pages/shared/SharedZtView.tsx`

Im `WochenplanTab`, innerhalb der `<tbody>`-Schleife (ab Zeile 380), die gleiche Abteilungs-Header-Logik wie in `ZtWochenplan.tsx` einbauen:

- Vor jeder Mitarbeiter-Zeile prüfen, ob sich die Abteilung gegenüber dem vorherigen Eintrag geändert hat
- Falls ja, eine `<tr>` mit dem Abteilungsnamen einfügen (farbiger `border-left`, dezenter Hintergrund via `getDepartmentBgClass`)
- Zebra-Striping innerhalb jeder Abteilung zurücksetzen
- Department-Farbindikator (schmaler Balken) links neben dem Mitarbeiternamen

Dies betrifft nur die Darstellungslogik im `<tbody>` — keine Backend- oder Datenänderungen nötig.

