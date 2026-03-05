

## Tooltip-Texte im erweiterten Modus ausführlicher gestalten

Die aktuellen Extended-Tooltips sind einzeilig und sagen nur "additiv zu So/Fei-Zuschlägen". Der User möchte eine genauere Erklärung, wie sich die additiven Zuschläge zusammensetzen.

### Änderung in `src/components/zeiterfassung/SfnTooltipHeader.tsx`

**EXTENDED_TEXT** wird von einfachen Strings zu mehrzeiligem JSX umgebaut. Die HoverCardContent wird breiter (`min-w-[280px]`) um den Inhalt aufzunehmen.

Neue Tooltip-Inhalte im Extended-Modus:

**20–24 (evening):**
> **25 % Nachtzuschlag** (20:00–00:00)
> Gilt additiv zu Sonntags- und Feiertagszuschlägen.
> Beispiel Sonntagsnachtschicht: 50 % (So) + 25 % (Nacht) = 75 % Zuschlag

**24–x (night):**
> **40 % Nachtzuschlag** (00:00–04:00)
> Gilt additiv zu Sonntags- und Feiertagszuschlägen.
> Beispiel Sonntagsnachtschicht: 50 % (So) + 40 % (Nacht) = 90 % Zuschlag

**So (sonntag):**
> **50 % Sonntagszuschlag** (§3b EStG)
> Wird mit Nachtzuschlägen gestapelt.
> Nachtstunden an Sonntagen erhalten beide Zuschläge.

**Fei (feiertag):**
> **125 % Feiertagszuschlag** (Standard-Feiertage)
> **150 %** für besondere Feiertage (1. Mai, 25./26.12.)
> Wird mit Nachtzuschlägen gestapelt.

### Technische Umsetzung

- `EXTENDED_TEXT` wird zu einer Funktion oder zu React-Elementen statt einfacher Strings
- `HoverCardContent` bekommt `min-w-[280px]` im Extended-Modus
- Simple-Modus bleibt unverändert (einzeilig)

### Betroffene Datei
- `src/components/zeiterfassung/SfnTooltipHeader.tsx`

