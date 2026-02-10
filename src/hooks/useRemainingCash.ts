import { useMemo } from 'react';
import { useCashBalanceData } from './useCashBalanceData';
import { usePettyCash } from './useSettings';

export function useRemainingCash(restaurantId: string | null, selectedDate: Date) {
  const { data: cashRows, isLoading: cashLoading } = useCashBalanceData(restaurantId);
  const { pettyCash, isLoading: pettyCashLoading } = usePettyCash(restaurantId);

  const remainingCash = useMemo(() => {
    if (!cashRows) return 0;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const filteredRows = cashRows.filter(r => r.date <= dateStr);
    const cumulativeCash = filteredRows.reduce((sum, r) => sum + r.bargeld, 0);
    return pettyCash + cumulativeCash;
  }, [cashRows, pettyCash, selectedDate]);

  return {
    remainingCash,
    isLoading: cashLoading || pettyCashLoading,
  };
}
