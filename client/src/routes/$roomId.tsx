import {createFileRoute, Navigate} from '@tanstack/react-router'
import {useContext} from "react";
import {GameContext} from "@/routes/__root";
import {SocketController} from "@/store/socket-controller.ts";
import {GameStore} from "@/store/game.ts";
import {toast} from "sonner";
import {GameView} from "@/components/GameView.tsx";

export const Route = createFileRoute('/$roomId')({
  component: RouteComponent,
})

function RouteComponent() {
    const { roomId } = Route.useParams()

    if (roomId.length < 5) {
        toast.info("Длина id комнаты должна быть больше 5")
        return <Navigate to='/'/>
    }

    const gameStore = useContext<GameStore>(GameContext)
    const socketController = new SocketController(gameStore, roomId);

    const oldName = localStorage.getItem("game-name")
    if (oldName) socketController.sendMyName(oldName)

    return <GameView sc={socketController}/>
}
