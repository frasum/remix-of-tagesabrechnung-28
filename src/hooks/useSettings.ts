import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PettyCashValue {
  amount: number;
}

export function usePettyCash() {
  const queryClient = useQueryClient();

  const { data: pettyCash, isLoading } = useQuery({
    queryKey: ['settings', 'petty_cash'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'petty_cash')
        .single();

      if (error) throw error;
      const value = data?.value as unknown as PettyCashValue | undefined;
      return value?.amount ?? 0;
    },
  });

  const { mutate: updatePettyCash, isPending: isUpdating } = useMutation({
    mutationFn: async (amount: number) => {
      const { error } = await supabase
        .from('settings')
        .update({ value: { amount } })
        .eq('key', 'petty_cash');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'petty_cash'] });
    },
  });

  return {
    pettyCash: pettyCash ?? 0,
    isLoading,
    updatePettyCash,
    isUpdating,
  };
}
