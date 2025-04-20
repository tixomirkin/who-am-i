import type {
    TEvent,
    TEventConnect,
    TEventEditGameName, TEventGetSync,
    TEventJoin,
    TEventLeave, TEventSpectator, TEventSync,
    TGameState,
    TPlayer
} from "../party/types";
import PartySocket from "partysocket";
import usePartySocket from "partysocket/react";
import {GameStore} from "./store/game";

export class SocketController {
    gameStore: GameStore;
    socket: PartySocket;

    constructor(gameStore: GameStore, room: string) {
        this.gameStore = gameStore;
        this.socket = usePartySocket({
            // host: 'who-am-i.tixomirkin.partykit.dev',
            host: 'localhost:1999',
            room: room,

            onMessage: (event) => this.onMessage(event),
            onOpen: (event) => this.gameStore.setMyId(this.socket.id)
        });
    }

    onMessage(e: MessageEvent) {
        const event = JSON.parse(e.data) as TEvent

        if (event.type == 'sync') {
            this.gameStore.onSync(event)
        }
        if (event.type == 'edit_game_name') {
            this.gameStore.onEditGameName(event)
        }
        if (event.type == 'join') {
            this.gameStore.onJoin(event)
        }
        if (event.type == 'connect') {
            this.gameStore.onConnect(event)
        }
        if (event.type == 'leave') {
            this.gameStore.onLeave(event)
        }
    }

    sendEditGameName(toId: string, newName: string) {
        console.log(toId, newName);
        const event: TEventEditGameName = {
            type: 'edit_game_name',
            id: this.socket.id,
            toId: toId,
            newGameName: newName
        }
        this.socket.send(JSON.stringify(event))
        this.gameStore.onEditGameName(event)
    }

    sendJoin() {
        const event: TEventJoin = {
            type: 'join',
            id: this.socket.id
        }
        this.socket.send(JSON.stringify(event))
        // this.gameStore.onJoin(event)
    }

    sendSync() {
        const event: TEventGetSync = {
            type: 'get_sync',
        }
        this.socket.send(JSON.stringify(event))
    }

    sendSpectator() {
        const event: TEventSpectator = {
            type: "spectator",
            id: this.socket.id,
        }
    }


}