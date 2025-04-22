import type {TPlayer} from "@/store/types";
import {SocketController} from "@/store/socket-controller";
import {PlayerView} from "@/components/PlayerView";
import {observer} from "mobx-react-lite";
import {GameStore, Player} from "@/store/game.ts";
import {useContext, useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";
import {Plus, RefreshCcw} from "lucide-react";
import EditPlayer from "@/components/edit-player.tsx";
import {GameContext} from "@/routes/__root.tsx";
// import { action } from "mobx";


export const GameView = observer( ({sc}: {sc: SocketController}) => {

    // useEffect(() => {
    //     const syncInterval = setInterval(() => sc.sendSync(), 3000)
    //     return () => clearInterval(syncInterval)
    // }, []);

    const gameStore = useContext<GameStore>(GameContext)

    const spectators = gameStore.players.filter((player) => player.isSpectator)
    const players = gameStore.players.filter((player) => !player.isSpectator)
    const me = gameStore.players.find((player) => player.id == sc.socket.id)

    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("game-name")) setEditOpen(true)
    }, []);


    if (!me) return null;


    return (
        <>
            <div className='w-full min-h-screen flex flex-row items-center justify-center p-10'>

                <div className='flex flex-row items-center justify-center flex-wrap gap-2'>
                    {players.map((player: Player) => {
                        return <PlayerView key={player.id} me={me} isTurn={sc.gameStore.turnPlayerId == player.id} player={player} sc={sc}/>
                    })}
                    {me.isSpectator && <Button variant='outline' className='w-50 h-80 text-center'
                                               onClick={() => sc.sendJoin()}>
                        <div className='flex flex-col items-center justify-center gap-2'>
                            <Plus className='size-10' />
                            Присоеденится
                        </div>
                    </Button>}
                </div>


            </div>

            <div className='flex flex-col items-end justify-center absolute top-3 right-3'>
                <h1>Наблюдатели</h1>
                {spectators.map((player: TPlayer) => {
                    return (
                        <div className='text-right' key={player.id}>
                            <p className='truncate w-30'>{player.name.length ? player.name : player.id}</p>
                        </div>
                    )
                })}
            </div>

            <div className='absolute top-3 left-3 flex flex-row gap-1'>
                <ModeToggle/>
                <EditPlayer player={me} open={editOpen} onOpenChange={setEditOpen} sc={sc}/>
                <Button onClick={() => sc.sendSync()} variant='outline' size='icon'><RefreshCcw/></Button>
            </div>
            {/*{me?.isSpectator && <button className="border" onClick={() => sc.sendJoin()}>Присоедениться</button>}*/}
            {/*{!me?.isSpectator && <button onClick={() => sc.sendJoin()}>Выйти</button>}*/}
        </>
    )
})