import { createContext } from 'react';

export const LoadingContext = createContext({
  isLoading: false,
  setLoading: (state: boolean, text?: string) => {},
});
