Kurzantwort: Nein, dieser Link ist für die Lohnbuchhaltung nicht der richtige öffentliche Link.

Explore
- Routing geprüft: `/lohnbuero` ist in `App.tsx` öffentlich (nicht hinter `ProtectedRoute`).
- Live-Check der URLs:
  - `https://id-preview--1d95220b-d302-4077-a268-e02b4b0166d8.lovable.app/lohnbuero` zeigt die Lovable-Login-Seite.
  - `https://tagesabrechnung.lovable.app/lohnbuero` zeigt korrekt das PIN-Formular („Lohnbüro Portal“).

Klarstellung
- Ursache ist nicht die PIN-Logik, sondern der Link-Typ:
  - **Preview-Link** = geschützt (Lovable-Login bzw. temporärer Token nötig).
  - **Published-Link** = öffentlich und für Lohnbuchhaltung gedacht.

Plan
1) Ab sofort nur diesen Link ans Lohnbüro geben:  
   `https://tagesabrechnung.lovable.app/lohnbuero`
2) Bereits geteilte `id-preview`-Links zurückziehen/ersetzen.
3) Bei Betroffenen einmal hart neu laden (Strg+Shift+R) oder im privaten Fenster testen.
4) Optional als dauerhafte Absicherung: „Lohnbüro-Link kopieren“-Button einbauen, der immer die veröffentlichte URL kopiert.
5) End-to-end prüfen: Link öffnen → PIN-Feld sichtbar → PIN eingeben → Periodenliste erscheint.