import { createContext, useContext, useState, ReactNode } from 'react';
import { getBusinessDate } from '@/utils/businessDate';

interface DateContextValue {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateContext = createContext<DateContextValue | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(getBusinessDate());
  
  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
}

export function useSelectedDate() {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useSelectedDate must be used within a DateProvider');
  }
  return context;
}
