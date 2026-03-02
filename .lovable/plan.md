

## Neues App-Icon ueberall einsetzen

### Ist-Zustand
Das aktuelle orangene Euro-Icon (Lucide `<Euro>`) wird als Branding-Logo in folgenden Layouts verwendet:
- **AppLayout.tsx** — Sidebar-Header (mobile + desktop), 2 Stellen
- **GlobalLayout.tsx** — Sidebar-Header (mobile + desktop), 2 Stellen
- **MobileLayout.tsx** — Header, 1 Stelle (aktuell `<Utensils>`)
- **Install.tsx** — bereits `app-icon.png`, bleibt
- **PWA-Manifest / Favicon** — referenzieren bereits `app-icon.png`

Die Euro-Icons in DailySummary und Statistics sind Daten-Icons (Waehrungssymbol), nicht Branding — die bleiben unveraendert.

### Aenderungen

1. **`public/app-icon.png` ersetzen** — Das hochgeladene Bild (`user-uploads://image-2.png`) wird als neues `public/app-icon.png` kopiert. Damit aendern sich automatisch PWA-Icons, Favicon-Referenz und Install-Seite.

2. **AppLayout.tsx** — An beiden Stellen (Zeile ~142-144 und ~260-262) den `<Euro>`-Lucide-Icon durch `<img src="/app-icon.png" className="w-5 h-5 rounded" />` ersetzen. Import von `Euro` entfernen.

3. **GlobalLayout.tsx** — An beiden Stellen (Zeile ~37-39 und ~105-107) dasselbe: `<Euro>` durch `<img src="/app-icon.png">` ersetzen. Import von `Euro` entfernen.

4. **MobileLayout.tsx** — Zeile ~22: `<Utensils>` durch `<img src="/app-icon.png" className="w-4 h-4 rounded" />` ersetzen. Import von `Utensils` entfernen.

### Betroffene Dateien
- `public/app-icon.png` (Datei ersetzen)
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/GlobalLayout.tsx`
- `src/components/layout/MobileLayout.tsx`

