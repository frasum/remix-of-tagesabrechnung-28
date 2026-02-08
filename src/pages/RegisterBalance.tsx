import { useState } from 'react';
import { Vault, Store, Plus, ArrowUpDown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterCard } from '@/components/register/RegisterCard';
import { TransferDialog } from '@/components/register/TransferDialog';
import { TransferList } from '@/components/register/TransferList';
import { useRegisterTransfers } from '@/hooks/useRegisterTransfers';
import { useRestaurant } from '@/hooks/useRestaurant';
import { toast } from 'sonner';

export default function RegisterBalance() {
  const { restaurantId } = useRestaurant();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    transfers,
    balances,
    isLoading,
    createTransfer,
    isCreating,
    deleteTransfer,
    isDeleting,
  } = useRegisterTransfers(restaurantId);

  const handleCreateTransfer = (data: Parameters<typeof createTransfer>[0]) => {
    createTransfer(data, {
      onSuccess: () => {
        toast.success('Transfer erfasst');
        setDialogOpen(false);
      },
      onError: (error) => {
        toast.error('Fehler beim Speichern: ' + error.message);
      },
    });
  };

  const handleDeleteTransfer = (id: string) => {
    deleteTransfer(id, {
      onSuccess: () => {
        toast.success('Transfer gelöscht');
      },
      onError: (error) => {
        toast.error('Fehler beim Löschen: ' + error.message);
      },
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ArrowUpDown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Wechselgeldbestand</h1>
              <p className="text-muted-foreground">
                Transfers zwischen Tresor und Restaurant-Kasse
              </p>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RegisterCard
            title="Tresor"
            subtitle="(Keller)"
            icon={Vault}
            initialAmount={balances.initialSafe}
            transferAmount={balances.totalToRestaurant - balances.totalToSafe}
            currentBalance={balances.safeBalance}
            isPositiveTransfer={false}
          />
          <RegisterCard
            title="Restaurant-Kasse"
            subtitle="(oben)"
            icon={Store}
            initialAmount={balances.initialRestaurant}
            transferAmount={balances.totalToRestaurant - balances.totalToSafe}
            currentBalance={balances.restaurantBalance}
            isPositiveTransfer={true}
          />
        </div>

        {/* Transfer History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Transfer-Verlauf</CardTitle>
            <Button onClick={() => setDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Neu
            </Button>
          </CardHeader>
          <CardContent>
            <TransferList
              transfers={transfers}
              onDelete={handleDeleteTransfer}
              isDeleting={isDeleting}
            />
          </CardContent>
        </Card>
      </div>

      <TransferDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateTransfer}
        restaurantId={restaurantId || ''}
        isPending={isCreating}
      />
    </AppLayout>
  );
}
