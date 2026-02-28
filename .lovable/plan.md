

## Plan: AppLayout in ZtLayout einbinden

### Problem
`ZtLayout` rendert nur `ZtSubNav` + `<Outlet />`, ohne das `AppLayout` (Sidebar mit Hauptnavigation). Dadurch fehlt auf allen Zeiterfassungs-Seiten die Möglichkeit, zu anderen Bereichen zurückzukehren.

### Lösung
`ZtLayout` mit `AppLayout` umwickeln, sodass die Hauptnavigation sichtbar bleibt und die ZT-Sub-Navigation darunter erscheint.

### Änderung

**`src/components/zeiterfassung/ZtLayout.tsx`** — `AppLayout` importieren und als äußeren Wrapper verwenden:

```tsx
import { Outlet } from "react-router-dom";
import { ZtSubNav } from "./ZtSubNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

export default function ZtLayout() {
  return (
    <ProtectedRoute requiredLevel="manager">
      <AppLayout>
        <div className="flex flex-col min-h-0 h-full">
          <ZtSubNav />
          <div className="flex-1 min-h-0 overflow-auto">
            <Outlet />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
```

Eine einzelne Datei-Änderung, keine weiteren Anpassungen nötig.

