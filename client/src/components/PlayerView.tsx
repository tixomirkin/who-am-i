import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Player} from "@/store/game.ts";
import { useDebounce } from "use-debounce";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Sparkle, X} from "lucide-react";
import {SocketController} from "@/store/socket-controller.ts";


function getAvatarStyle(url: string | null) {
    if (!url) return undefined;
    return {backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center center'}
}

type PlayerViewProps = {
    player: Player;
    me: Player;
    isTurn: boolean;
    sc: SocketController
}


export const PlayerView = observer(({me, isTurn, player, sc}: PlayerViewProps) => {

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
        <div className={`border border-border shadow-card rounded-xl ${isTurn && 'outline-2'}`}>
            <div className='w-50 h-50 relative group bg-primary rounded-t-xl' style={getAvatarStyle(player.avatar)}>
                {me.id == player.id &&
                    <Button onClick={() => sc.sendSpectator()} className='absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity' variant='ghost' size='icon'><X/></Button>}

            </div>
            <div className='p-3 text-center w-50'>
                <div className={`flex items-center justify-center mb-1.5 gap-2 ${me.id == player.id && 'text-primary'}`}>
                    {player.isAdmin && <Sparkle className='inline-block h-4 w-4 min-w-4 min-h-4'/>}
                    <p className={`truncate text-xl font-bold  `}>
                        {player.name.length ? player.name : player.id}
                    </p>
                </div>
            {/*<p className='truncate '>{player.id}</p>*/}
                {me.id == player.id && isTurn ?
                    <Button className='h-16 w-full' onClick={() => sc.sendEndTurn()}>Закончить ход</Button> :
                    <Textarea
                        className='resize-none h-16 text-center'
                        disabled={me.isSpectator || me.id == player.id}
                        value={me.id == player.id ? '' : gameName}
                        placeholder={player.gameName.length ? 'Who am i?' : '' }
                        onChange={(event) => setGameName(event.target.value)}
                    />}

            </div>

        </div>
        // <div className='text-center'>
        //
        //
        // </div>
    )
})