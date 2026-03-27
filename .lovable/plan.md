

## Abteilungssummen & Gesamt-Footer bei aktiver Suche ausblenden

Wenn ein Suchbegriff eingegeben ist, werden die Abteilungs-Summenzeilen (SUMME KÜCHE, SUMME SERVICE) und die Gesamt-Zeile am Ende ausgeblendet — sie sind bei Einzelsuche nicht nützlich.

### Änderungen

**1. `src/pages/zeiterfassung/ZtBuchhaltung.tsx`**
- Footer (`BuchhaltungFooter`) nur rendern wenn `searchTerm` leer ist
- Department-Header (`BuchhaltungDeptHeader`) nur rendern wenn `searchTerm` leer ist

**2. `src/pages/zeiterfassung/ZtZusammenfassung.tsx`**
- Abteilungs-Subtotal-Zeile (`showDeptSubtotal`-Block, Zeile 303-325) nur rendern wenn `searchTerm` leer ist
- Department-Header (Zeile 265-270) nur rendern wenn `searchTerm` leer ist
- Gesamt-Footer (`tfoot`, Zeile 330-349) nur rendern wenn `searchTerm` leer ist

**3. `src/pages/shared/PayrollPortal.tsx`**
- Gleiche Logik: `searchTerm` an die Buchhaltung/Zusammenfassung-Komponenten durchreichen (prüfen ob bereits vorhanden)

3 Dateien, jeweils 1-2 Zeilen Bedingung ergänzen (`!searchTerm.trim()`).

