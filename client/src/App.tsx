import {SocketController} from "@/store/socket-controller.ts";
import {GameView} from "@/components/GameView.tsx";
import {useContext} from "react";
import {GameContext} from "@/main.tsx";

function App() {

  const gameStore = useContext(GameContext)
  const socketController = new SocketController(gameStore, 'ex-room');

  return (
      <GameView sc={socketController}/>
  );
}

export default App
