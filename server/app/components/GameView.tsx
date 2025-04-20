import type {TGameState, TPlayer} from "../../party/types";
import {SocketController} from "../socket-controller";
import {PlayerView} from "./PlayerView";
import {observer} from "mobx-react-lite";
import {GameStore, Player} from "../store/game";
import {useContext, useEffect} from "react";
import {GameContext} from "../client";

export const GameView = observer( ({sc}: {sc: SocketController}) => {
    useEffect(() => {
        const syncInterval = setInterval(() => sc.sendSync(), 5000)
        return () => clearInterval(syncInterval)
    }, []);

    const gameStore = useContext(GameContext)

    const spectators = gameStore.players.filter((player) => player.isSpectator)
    const players = gameStore.players.filter((player) => !player.isSpectator)
    const me = gameStore.players.find((player) => player.id == sc.socket.id)

    if (!me) return null;



    // console.log(players)

    return (
        <>
            <h1>Наблюдатели</h1>
            {spectators.map((player: TPlayer) => {
                return (
                    <div key={player.id}>
                        <p>{player.id}</p>
                        <p>{player.name}</p>
                    </div>
                )
            })}
            <h1>Игроки</h1>
            <div>
            {players.map((player: Player) => {
                return <PlayerView key={player.id} me={me} player={player} sc={sc}/>
            })}
            </div>
            {me?.isSpectator && <button onClick={() => sc.sendJoin()}>Присоедениться</button>}
            {/*{!me?.isSpectator && <button onClick={() => sc.sendJoin()}>Выйти</button>}*/}
        </>
    )
})