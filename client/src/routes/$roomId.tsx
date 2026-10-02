import {createFileRoute, Navigate} from '@tanstack/react-router'
import {useContext, useEffect, useMemo} from "react";
import {GameContext} from "@/store/context.ts";
import {SocketController} from "@/store/socket-controller.ts";
import {GameStore} from "@/store/game.ts";
import {toast} from "sonner";
import {GameView} from "@/components/GameView.tsx";

export const Route = createFileRoute('/$roomId')({
  component: RouteComponent,
})

function RouteComponent() {
    const { roomId } = Route.useParams()
    const gameStore = useContext<GameStore>(GameContext)

    const socketController = useMemo(() => {
        if (roomId.length >= 5) {
            return new SocketController(gameStore, roomId);
        }
        return null;
    }, [gameStore, roomId]);

    useEffect(() => {
        if (socketController) {
            const oldName = localStorage.getItem("game-name")
            const oldAvatar = localStorage.getItem("game-avatar")
            if (oldName) socketController.sendMyName(oldName)
            if (oldAvatar) socketController.sendMyAvatar(oldAvatar)
        }

        return () => {
            if (socketController) {
                socketController.socket.close();
            }
        };
    }, [socketController]);

    if (roomId.length < 5) {
        toast.info("Длина id комнаты должна быть больше 5")
        return <Navigate to='/'/>
    }

    if (!socketController) return null;

    return <GameView sc={socketController}/>
}
