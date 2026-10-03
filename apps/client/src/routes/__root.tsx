import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from '@/lib/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { GameContext, gameStore } from '@/store/context';
import { I18nProvider } from '@/i18n/context';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <I18nProvider>
        <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
          <GameContext.Provider value={gameStore}>
            <Outlet />
            <Toaster />
          </GameContext.Provider>
        </ThemeProvider>
      </I18nProvider>
    </React.Fragment>
  );
}
