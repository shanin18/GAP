'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { Destination } from '@/lib/destinations';
const Context = createContext<Destination[]>([]);
export function DestinationsProvider({ destinations, children }: { destinations: Destination[]; children: ReactNode }) {
  return <Context.Provider value={destinations}>{children}</Context.Provider>;
}
export const useDestinations = () => useContext(Context);
