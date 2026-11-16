import { createContext, useContext, type ReactNode } from 'react';
import { useAppViewModel, type AppViewModel } from './useAppViewModel';

const AppContext = createContext<AppViewModel | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  return <AppContext.Provider value={useAppViewModel()}>{children}</AppContext.Provider>;
}

export function useApp() {
  const app = useContext(AppContext);
  if (!app) throw new Error('useApp() tiene que usarse dentro de <AppProvider>');
  return app;
}
