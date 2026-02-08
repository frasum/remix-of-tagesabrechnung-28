import { createContext, useContext, ReactNode } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface RestaurantContextValue {
  restaurant: Restaurant | null;
  restaurantId: string | null;
  restaurantName: string;
  restaurantSlug: string;
  isLoading: boolean;
  error: Error | null;
}

const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const { restaurant: slug } = useParams<{ restaurant: string }>();
  
  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as Restaurant;
    },
    enabled: !!slug,
  });

  // If slug is provided but restaurant not found and not loading, show 404
  if (!isLoading && slug && !restaurant && !error) {
    return <Navigate to="/spicery" replace />;
  }

  const value: RestaurantContextValue = {
    restaurant: restaurant ?? null,
    restaurantId: restaurant?.id ?? null,
    restaurantName: restaurant?.name ?? '',
    restaurantSlug: restaurant?.slug ?? slug ?? '',
    isLoading,
    error: error as Error | null,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}

// Hook to get all available restaurants for the switcher
export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Restaurant[];
    },
  });
}
