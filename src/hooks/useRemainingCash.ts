import { useMemo } from 'react';
import { useCashBalanceData } from './useCashBalanceData';
import { usePettyCash } from './useSettings';

export function useRemainingCash(restaurantId: string | null, selectedDate: Date) {
  const { data: cashRows, isLoading: cashLoading } = useCashBalanceData(restaurantId);
  const { pettyCash, isLoading: pettyCashLoading } = usePettyCash(restaurantId);

  const result = useMemo(() => {
    if (!cashRows) return { remainingCash: 0, todaySkimAmount: 0, totalSkimmed: 0 };
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const filteredRows = cashRows
      .filter(r => r.date <= dateStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Day-by-day simulation with skimming
    let kassenbestand = pettyCash;
    let totalSkimmed = 0;
    let todaySkimAmount = 0;

    for (const row of filteredRows) {
      kassenbestand += row.rawBargeld;
      let skim = 0;
      if (kassenbestand > pettyCash) {
        skim = kassenbestand - pettyCash;
        kassenbestand = pettyCash;
      }
      totalSkimmed += skim;
      if (row.date === dateStr) {
        todaySkimAmount = skim;
      }
    }

    return { remainingCash: kassenbestand, todaySkimAmount, totalSkimmed };
  }, [cashRows, pettyCash, selectedDate]);

  return {
    ...result,
    isLoading: cashLoading || pettyCashLoading,
  };
}
