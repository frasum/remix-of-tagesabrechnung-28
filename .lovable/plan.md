
# Plan: QR-Code für Multi-Restaurant Anpassung

## Problem

Aktuell ist die QR-Code-URL in zwei Komponenten fest auf `https://spicery.lovable.app/waiter` gesetzt:
1. **WaiterQRCode.tsx** - wird auf der Mitarbeiterseite (`/staff`) angezeigt
2. **WaiterQRPoster.tsx** - wird über `/:restaurant/qr-poster` aufgerufen

Da die Mitarbeiterseite global ist (nicht im Restaurant-Kontext), muss hier eine Restaurant-Auswahl hinzugefügt werden, damit der QR-Code für das richtige Restaurant generiert wird.

---

## Änderungen

### 1. WaiterQRCode.tsx - Restaurant-Auswahl hinzufügen

Die Komponente wird erweitert um:
- Einen Dropdown zur Auswahl des Restaurants (Spicery oder YUM)
- Dynamische URL-Generierung basierend auf der Auswahl
- Angepasster Download-Dateiname mit Restaurant-Namen

```
┌──────────────────────────────────┐
│ 🔲 Kellner Self-Service          │
│ QR-Code für mobile Abrechnung    │
├──────────────────────────────────┤
│  Restaurant: [Spicery    ▼]      │  ← NEU: Dropdown
│                                  │
│         ┌───────────┐            │
│         │  QR-Code  │            │
│         └───────────┘            │
│                                  │
│  spicery.lovable.app/spicery/... │
│                                  │
│  [QR laden] [Öffnen]             │
│  [   Poster drucken   ]          │
└──────────────────────────────────┘
```

**Technische Änderungen:**
- Import von `useRestaurants` Hook zum Laden aller Restaurants
- State für ausgewähltes Restaurant
- Dynamische URL: `https://spicery.lovable.app/{slug}/waiter`
- Download-Dateiname: `kellner-self-service-{restaurant}.png`
- Poster-Link: `/{slug}/qr-poster`

### 2. WaiterQRPoster.tsx - Restaurant-Kontext nutzen

Das QR-Poster ist bereits unter `/:restaurant/qr-poster` geroutet und hat Zugriff auf den RestaurantContext.

**Änderungen:**
- `useRestaurant` Hook importieren
- URL dynamisch generieren: `https://spicery.lovable.app/{slug}/waiter`
- Restaurant-Name im Poster-Header anzeigen (z.B. "Kellner Self-Service - Spicery")

### 3. URL-Format

Die neuen URLs folgen dem Multi-Restaurant-Schema:

| Restaurant | Waiter URL |
|------------|------------|
| Spicery | `https://spicery.lovable.app/spicery/waiter` |
| YUM | `https://spicery.lovable.app/yum/waiter` |

---

## Dateien die geändert werden

1. **src/components/manager/WaiterQRCode.tsx**
   - Restaurant-Dropdown hinzufügen
   - Dynamische URL-Generierung
   - Angepasster Download-Name

2. **src/pages/WaiterQRPoster.tsx**
   - useRestaurant Hook nutzen
   - Dynamische URL und Restaurant-Name im Poster

---

## Ergebnis

- Der QR-Code auf der Mitarbeiterseite zeigt einen Dropdown um zwischen Restaurants zu wechseln
- Das gedruckte Poster zeigt den korrekten Restaurant-Namen und die richtige URL
- Jedes Restaurant hat seinen eigenen QR-Code der zur richtigen Self-Service-Seite führt
