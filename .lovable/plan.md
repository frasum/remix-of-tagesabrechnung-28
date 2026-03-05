

## Diagnose: SFN-Modus in der Lohnbüro-Zusammenfassung

### Befund

Der Code in `PayrollZusammenfassungTab` (Zeilen 869-984) sieht korrekt aus — `isExtended` steuert die Spaltenanzahl in Header und Body. Trotzdem funktioniert der Umschalter nicht im Zusammenfassung-Tab des Lohnbüro-Portals.

### Hypothese

Die `key`-basierte Remount-Strategie (`key={`zus-${sfnMode}`}`) auf dem Komponenten-Aufruf innerhalb von `TabsContent` greift möglicherweise nicht zuverlässig, da Radix `TabsContent` inaktive Tabs unmountet — beim Wechsel von Buchhaltung (wo der Toggle funktioniert) zurück auf Zusammenfassung wird die Komponente ohnehin neu gemountet, aber **mit der default-Prop** `sfnMode = "simple"`, falls die Prop-Übergabe versagt.

Zusätzlich hat `PayrollZusammenfassungTab` kein visuelles Feedback, ob der Modus ankommt (im Gegensatz zu Buchhaltung, die jetzt eine Badge hat).

### Lösung (3 Schritte)

1. **Debug-Badge in `PayrollZusammenfassungTab` hinzufügen** — identisch zur Buchhaltung-Tab, um sofort visuell zu sehen, welcher Modus aktiv ist.

2. **`useSfnMode()` direkt in `PayrollZusammenfassungTab` aufrufen** statt sich auf die Prop-Übergabe zu verlassen. Da der Hook `useState` mit localStorage-Initializer verwendet, liest die Komponente den Modus bei jedem Mount korrekt. Das eliminiert jede mögliche Prop-Durchreichungs-Problematik.

3. **Gleiche Änderung in `ZtZusammenfassung.tsx`** — auch dort `useSfnMode()` direkt aufrufen statt über `useOutletContext`, da die reguläre Zusammenfassungs-Seite das gleiche Problem haben könnte.

### Betroffene Dateien

- `src/pages/shared/PayrollPortal.tsx` — `PayrollZusammenfassungTab`: Hook direkt aufrufen + Badge hinzufügen
- `src/pages/zeiterfassung/ZtZusammenfassung.tsx` — `useSfnMode()` direkt aufrufen als Fallback/Absicherung

