

## Problem

The `handleDownloadPdf` callback (line 436) is missing `session` and `toast` in its dependency array:

```
}, [pdfPreview, selectedDate, restaurantName, user?.name, settings?.show_pdf_export_notification]);
```

Because `session` is not a dependency, its value is captured as `null` from the initial render. When the PDF is downloaded, `session?.id` evaluates to `false` and the `send-settlement` call is skipped entirely.

## Fix

Add `session` and `toast` to the `useCallback` dependency array on line 436:

```typescript
}, [pdfPreview, selectedDate, restaurantName, user?.name, settings?.show_pdf_export_notification, session, toast]);
```

This is a one-line change that fixes the stale closure, ensuring the settlement webhook fires on every PDF export.

