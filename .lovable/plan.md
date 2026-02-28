

## Problem

Der Code-Fix (Hinzufügen von `session` und `toast` zur Dependency-Liste) ist im Quellcode korrekt angewendet. Aber:

1. Die **veröffentlichte App** unter `tagesabrechnung.lovable.app` enthält möglicherweise noch den alten Code ohne den Fix
2. Die **Vorschau-URL** enthält den aktuellen Code

Um sicherzustellen, dass der Webhook zuverlässig funktioniert, und um das Problem zu debuggen, schlage ich zwei Maßnahmen vor:

## Plan

### 1. Debug-Logging hinzufügen
Ein `console.log` direkt vor der `if (session?.id)` Prüfung einbauen, damit wir sehen können, ob `session` zum Zeitpunkt des Downloads tatsächlich befüllt ist:

```typescript
console.log('handleDownloadPdf – session:', session?.id, 'pdfPreview:', !!pdfPreview);
```

Dies hilft beim nächsten Test sofort zu erkennen, ob der Webhook-Aufruf übersprungen wird.

### 2. App neu veröffentlichen
Nach dem Fix muss die App neu veröffentlicht werden, damit der Fix auch auf `tagesabrechnung.lovable.app` aktiv ist. Der Test sollte dann über die **Vorschau-URL** oder die **neu veröffentlichte App** erfolgen.

