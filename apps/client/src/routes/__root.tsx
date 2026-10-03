import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'

import {ThemeProvider} from "@/lib/theme-provider.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {GameContext, gameStore} from "@/store/context.ts";


export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <React.Fragment>
        <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
            <GameContext.Provider value={gameStore}>
                <Outlet/>
                <Toaster />
            </GameContext.Provider>
        </ThemeProvider>
    </React.Fragment>
  )
}
