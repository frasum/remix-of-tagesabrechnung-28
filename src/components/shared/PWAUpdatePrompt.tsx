import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <RefreshCw className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-display font-semibold text-foreground">
          Neue Version verfügbar
        </h2>
        <p className="text-sm text-muted-foreground">
          Die App wurde aktualisiert. Bitte lade neu, um die neueste Version zu verwenden.
        </p>
        <Button
          onClick={() => updateServiceWorker(true)}
          size="lg"
          className="w-full text-base"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Jetzt aktualisieren
        </Button>
      </div>
    </div>
  );
}
