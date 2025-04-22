import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Player} from "@/store/game.ts";
import { useDebounce } from "use-debounce";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {X} from "lucide-react";
import {SocketController} from "@/store/socket-controller.ts";

// https://i.imgur.com/N1GP3rT.jpeg
// <div style={{backgroundImage: 'url(https://i.imgur.com/N1GP3rT.jpeg)'}}>
//     adadad
// </div>

function getAvatarStyle(url: string | null) {
    if (!url) return undefined;
    return {backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center center'}
}

export const PlayerView = observer(({me, player, sc}: {me: Player, player: Player, sc: SocketController}) => {

    if (me.id == player.id) return (
        <div className='border border-border shadow-card rounded-xl group'>
            <div className='w-50 h-50 bg-primary rounded-t-xl relative' style={getAvatarStyle(player.avatar)}>
                <Button onClick={() => sc.sendSpectator()} className='absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity' variant='ghost' size='icon'><X/></Button>
            </div>
            {/*<p>{player.name}</p>*/}
            <div className='p-3 text-center w-50'>
                <p className='truncate text-xl text-primary font-bold mb-1.5'>{player.name.length ? player.name : player.id}</p>
                <Textarea
                    className='resize-none h-16'
                    placeholder={player.gameName.length ? 'Who am i?' : '' }
                    // placeholder={player.gameName}
                    disabled
                />
            </div>

        </div>
    )

    const [gameName, setGameName] = useState<string>(player.gameName)
    const [debouncedValue] = useDebounce(gameName, 250);

    useEffect(
        () => sc.sendEditGameName(player.id, debouncedValue),
        [debouncedValue]
    );

    useEffect(
        () => setGameName(player.gameName),
        [player.gameName]
    );

    return (
        <div className='border border-border shadow-card rounded-xl'>
            <div className='w-50 h-50 bg-primary rounded-t-xl' style={getAvatarStyle(player.avatar)}>

            </div>
            {/*<p>{player.name}</p>*/}
            <div className='p-3 text-center w-50'>
                <p className='truncate text-xl font-bold mb-1.5'>{player.name.length ? player.name : player.id}</p>
                {/*<p className='truncate '>{player.id}</p>*/}
                <Textarea
                    className='resize-none h-16'
                    disabled={me.isSpectator}
                    value={gameName}
                    onChange={(event) => setGameName(event.target.value)}
                />
            </div>

        </div>
        // <div className='text-center'>
        //
        //
        // </div>
    )
})