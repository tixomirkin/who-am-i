import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'

import {GameStore} from "@/store/game.ts";
import {createContext} from "react";
import {ThemeProvider} from "@/lib/theme-provider.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";

const gameStore = new GameStore()
export const GameContext = createContext<GameStore>(gameStore)

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
