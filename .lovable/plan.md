

## Plan: Vergleichs-Deltas in den Zusammenfassungskarten anzeigen

### Idee

In den drei Karten (Grundbrutto, Netto-Auszahlung, AG-Gesamtkosten) wird zusätzlich ein kleiner Delta-Hinweis angezeigt, der den Unterschied zum jeweils anderen SFN-Modus zeigt — z.B. "+85,40 € im §3b-Modus" oder "−85,40 € im einfachen Modus".

### Umsetzung

**Datei:** `src/pages/zeiterfassung/ZtBruttoNetto.tsx`

1. **Lokale SFN-Bonus-Differenz berechnen**: Da SFN-Zuschläge immer lokal berechnet werden (nicht über die Lohnica-API), können wir aus `sfnData` und `sfnOther` den Bonus-Unterschied direkt ableiten, ohne die API ein zweites Mal aufzurufen:
   - Den SFN-Stundensatz (`sfnHourlyRate`) mit den jeweiligen Stunden und Zuschlagssätzen multiplizieren
   - Differenz = `otherBonus - currentBonus`

2. **Hilfsfunktion `computeSfnBonus`**: Nimmt ein `SfnAggResult` und den Stundensatz, berechnet den Gesamtzuschlag nach den Raten aus `sfnRates.ts`.

3. **Delta-Anzeige in den Karten**:
   - **Grundbrutto**: Kein Delta (bleibt gleich zwischen Modi, da es vom Grundlohn abhängt)
   - **Netto-Auszahlung**: Delta zeigen, da sich die steuerfreien SFN-Zuschläge ändern → `±XX,XX € im [anderen Modus]`
   - **AG-Gesamtkosten**: Ebenfalls Delta, da SFN-Zuschläge die Gesamtkosten beeinflussen

4. **Visuelles Design**: Kleiner Text unter dem Hauptbetrag, mit Pfeil-Icon (↑/↓) und farblich codiert (grün = mehr im anderen Modus, rot = weniger). Label zeigt den Namen des anderen Modus.

### Betroffene Datei
- `src/pages/zeiterfassung/ZtBruttoNetto.tsx` — Zusammenfassungskarten-Bereich (Zeilen 572–595)

