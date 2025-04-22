import {SocketController} from "../socket-controller";
import React, {useDeferredValue, useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Player} from "../store/game";
import {useDebounce} from "use-debounce";


export const PlayerView = observer(({me, player, sc}: { me: Player, player: Player, sc: SocketController }) => {

    if (me.id == player.id) return (
        <div>
            <h2>{player.name}</h2>
            <h2>{player.id}</h2>
            <p>??? {player.gameName} ???</p>
        </div>
    )

    const [gameName, setGameName] = useState<string>(player.gameName)
    const [debouncedValue] = useDebounce(gameName, 250);

    useEffect(
        () => sc.sendEditGameName(player.id, debouncedValue),
        [debouncedValue]
    );

    // useEffect(
    //     () => setGameName(player.gameName),
    //     [player.gameName]
    // );

    return (
        <div>
            <h2>{player.name}</h2>
            <h3>{player.id}</h3>
            <input
                disabled={me.isSpectator}
                value={gameName}
                onChange={(event) => setGameName(event.target.value)}
            />

        </div>
    )
})