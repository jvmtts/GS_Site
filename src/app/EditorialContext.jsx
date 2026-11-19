import { createContext, useContext } from 'react';

export const EditorialContext = createContext(null);

export function useEditorialContent() {
  const context = useContext(EditorialContext);
  if (!context) throw new Error('O catálogo editorial não está disponível.');
  return context;
}
