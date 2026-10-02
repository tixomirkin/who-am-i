import {createContext} from "react";
import {GameStore} from "./game";

export const gameStore = new GameStore()
export const GameContext = createContext<GameStore>(gameStore)
