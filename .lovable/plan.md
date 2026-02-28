

## Plan: ZT Sub-Navigation als Tab-Leiste

### Umsetzung

**1. Neue Komponente `src/components/zeiterfassung/ZtSubNav.tsx` erstellen**

Eine horizontale Tab-Leiste mit 5 Links (Übersicht, Wochenplan, Zusammenfassung, Buchhaltung, Perioden), die `NavLink` aus `react-router-dom` nutzt. Aktiver Tab wird visuell hervorgehoben. Responsive -- scrollbar auf Mobile.

**2. ZT-Layout-Wrapper `src/components/zeiterfassung/ZtLayout.tsx` erstellen**

Wrapper-Komponente die `ZtSubNav` oben rendert und darunter `<Outlet />` für die aktive Unterseite. Wird als Layout-Route in `App.tsx` eingesetzt.

**3. `App.tsx` Routen refactoren**

Die 5 ZT-Routen werden unter eine gemeinsame Layout-Route verschachtelt:

```text
<Route path="zeiterfassung" element={<ZtLayout />}>
  <Route index element={<ZtDashboard />} />
  <Route path="wochenplan" element={<Wochenplan />} />
  <Route path="zusammenfassung" element={<Zusammenfassung />} />
  <Route path="buchhaltung" element={<ZtBuchhaltung />} />
  <Route path="perioden" element={<Perioden />} />
</Route>
```

Die `ProtectedRoute requiredLevel="manager"` Absicherung wird in `ZtLayout` einmal angewandt statt pro Route.

**4. Einzelne ZT-Seiten anpassen**

Aus jeder Seite den äußeren `<div className="space-y-6 p-4">` Wrapper und die `<h1>` Überschrift entfernen (wird vom Layout bereitgestellt) -- oder alternativ beibehalten falls jede Seite ihren eigenen Titel behalten soll.

