
# Plan: PDF-Vorschau Fix

## Problem
Die PDF-Vorschau zeigt einen leeren weissen Bereich an, obwohl der Dialog und die Buttons korrekt funktionieren. Das PDF wird generiert, aber nicht im iframe angezeigt.

## Ursache
Das Problem liegt daran, dass der Blob fuer die PDF ohne expliziten MIME-Type erstellt wird und einige Browser/Umgebungen Schwierigkeiten haben, PDFs direkt in iframes anzuzeigen.

## Loesung

### 1. Blob mit korrektem MIME-Type erstellen
In `src/utils/pdfExport.ts` muss der Blob explizit als `application/pdf` erstellt werden:

```typescript
// Aktuell:
const blob = doc.output('blob');

// Korrigiert:
const pdfBlob = doc.output('blob');
const blob = new Blob([pdfBlob], { type: 'application/pdf' });
```

### 2. Fallback mit object-Tag
Da einige Browser PDFs in iframes nicht richtig rendern, wird ein `<object>`-Tag als Fallback verwendet, der bessere PDF-Unterstuetzung bietet:

```typescript
// In CashBalance.tsx:
<object
  data={pdfPreview.blobUrl}
  type="application/pdf"
  className="w-full h-full rounded-md border"
>
  <p>PDF konnte nicht angezeigt werden.</p>
</object>
```

### 3. Alternative: embed-Tag
Falls `object` nicht funktioniert, kann auch `<embed>` verwendet werden:

```typescript
<embed
  src={pdfPreview.blobUrl}
  type="application/pdf"
  className="w-full h-full rounded-md border"
/>
```

## Aenderungen

### Datei 1: src/utils/pdfExport.ts
- Blob mit explizitem `application/pdf` MIME-Type erstellen
- Zeile 706: `doc.output('blob')` durch Blob-Erstellung mit MIME-Type ersetzen

### Datei 2: src/pages/CashBalance.tsx
- iframe durch object-Tag ersetzen fuer bessere PDF-Kompatibilitaet
- Optional: Fallback-Nachricht wenn PDF nicht angezeigt werden kann

## Technische Details

### Warum object statt iframe?
- `<object>` ist speziell fuer eingebettete Inhalte wie PDFs konzipiert
- Bietet bessere Browser-Kompatibilitaet fuer PDF-Anzeige
- Ermoeglicht Fallback-Content wenn das PDF nicht geladen werden kann
- Wird von allen modernen Browsern unterstuetzt

### MIME-Type Wichtigkeit
Der Browser muss wissen, dass es sich um ein PDF handelt, um den integrierten PDF-Viewer zu verwenden. Ohne expliziten MIME-Type kann der Browser den Inhalt als generischen Blob behandeln und nicht richtig darstellen.
