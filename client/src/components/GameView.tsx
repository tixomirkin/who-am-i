import type {TGameState, TPlayer} from "@/store/types";
import {SocketController} from "@/store/socket-controller";
import {PlayerView} from "@/components/PlayerView";
import {observer} from "mobx-react-lite";
import {GameStore, Player} from "@/store/game.ts";
import {useContext, useEffect, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {ModeToggle} from "@/components/mode-toggle.tsx";
import {Plus} from "lucide-react";
import EditPlayer from "@/components/edit-player.tsx";

export const GameView = observer( ({sc}: {sc: SocketController}) => {
    useEffect(() => {
        const syncInterval = setInterval(() => sc.sendSync(), 5000)
        return () => clearInterval(syncInterval)
    }, []);

    const spectators = sc.gameStore.players.filter((player) => player.isSpectator)
    const players = sc.gameStore.players.filter((player) => !player.isSpectator)
    const me = sc.gameStore.players.find((player) => player.id == sc.socket.id)

    const [editOpen, setEditOpen] = useState(false);

    useEffect(() => {
        if (!me?.name) setEditOpen(true)
    }, [me]);

    if (!me) return null;


    // console.log(players)

    return (
        <>
            <div className='w-full min-h-screen flex flex-row items-center justify-center p-10'>

                <div className='flex flex-row items-center justify-center flex-wrap gap-2'>
                    {players.map((player: Player) => {
                        return <PlayerView key={player.id} me={me} player={player} sc={sc}/>
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
            </div>
            {/*{me?.isSpectator && <button className="border" onClick={() => sc.sendJoin()}>Присоедениться</button>}*/}
            {/*{!me?.isSpectator && <button onClick={() => sc.sendJoin()}>Выйти</button>}*/}
        </>
    )
})