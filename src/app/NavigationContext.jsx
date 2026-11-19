import { createContext, useContext } from 'react';

export const NavigationContext = createContext(null);

export function useNavigation() {
  const navigation = useContext(NavigationContext);
  if (!navigation) throw new Error('useNavigation precisa de NavigationContext.Provider');
  return navigation;
}
