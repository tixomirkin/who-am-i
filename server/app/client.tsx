import "./styles.css";
import { createRoot } from "react-dom/client";
import {createContext, useState} from "react";
import {SocketController} from "./socket-controller";
import {GameView} from "./components/GameView";
import {GameStore} from "./store/game";

const gameStore = new GameStore()
export const GameContext = createContext<GameStore>(gameStore)


function App() {
    const socketController = new SocketController(gameStore, 'ex-room');

    return (
        <GameView sc={socketController}/>
    );
}

createRoot(document.getElementById("app")!).render(
    <GameContext.Provider value={gameStore}>
        <App/>
    </GameContext.Provider>
);
