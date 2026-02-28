import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ensurePeriodsExist } from "@/lib/periodUtils";
import { useRestaurant } from "@/contexts/RestaurantContext";

type ZtContextType = {
  selectedPeriodId: string;
  setSelectedPeriodId: (id: string) => void;
  periods: any[] | undefined;
  isLoadingPeriods: boolean;
};

const ZtContext = createContext<ZtContextType | undefined>(undefined);

/**
 * ZtProvider manages scheduling period selection for the Zeiterfassung module.
 * It reuses the existing RestaurantContext for restaurant selection.
 */
export function ZtProvider({ children }: { children: ReactNode }) {
  const { restaurantId } = useRestaurant();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  // Reset period when restaurant changes
  useEffect(() => {
    setSelectedPeriodId("");
  }, [restaurantId]);

  // Load periods for the selected restaurant
  const { data: periods, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ["zt-periods", restaurantId],
    queryFn: async () => {
      await ensurePeriodsExist(restaurantId!);
      const { data, error } = await supabase
        .from("scheduling_periods")
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });

  // Auto-select the period containing today's date, fallback to newest
  useEffect(() => {
    if (periods?.length && !selectedPeriodId) {
      const today = format(new Date(), "yyyy-MM-dd");
      const currentPeriod = periods.find(
        (p) => p.start_date <= today && p.end_date >= today
      );
      setSelectedPeriodId(currentPeriod?.id ?? periods[0].id);
    }
  }, [periods, selectedPeriodId]);

  return (
    <ZtContext.Provider
      value={{
        selectedPeriodId,
        setSelectedPeriodId,
        periods,
        isLoadingPeriods,
      }}
    >
      {children}
    </ZtContext.Provider>
  );
}

export function useZtContext() {
  const ctx = useContext(ZtContext);
  if (!ctx) throw new Error("useZtContext must be used within ZtProvider");
  return ctx;
}
