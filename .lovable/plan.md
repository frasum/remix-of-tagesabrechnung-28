

# Label-Verwaltung nur fuer Admins sichtbar machen

## Aenderung

In `src/pages/DailySummary.tsx` (Zeile 1156) wird die Sichtbarkeitsbedingung der `LabelSettings`-Komponente eingeschraenkt:

| Aktuell | Neu |
|---|---|
| `user?.permissionLevel && user.permissionLevel !== 'staff'` | `user?.permissionLevel === 'admin'` |

Das bedeutet: Manager sehen die Label-Verwaltung nicht mehr, nur Admins haben Zugriff darauf. Die Labels und Ausblendungen, die ein Admin konfiguriert, gelten weiterhin fuer alle Nutzer (Manager, Kellner, PWA).

## Betroffene Datei

| Datei | Aenderung |
|---|---|
| `src/pages/DailySummary.tsx` | Zeile 1156: Bedingung auf `=== 'admin'` aendern |

