import type {
    TEvent,
    TEventEditGameName, TEventEditMyAvatar, TEventEditMyName, TEventGetSync,
    TEventJoin, TEventSpectator, TEventEntTurn, TEventSetAdmin
} from "@/store/types";
import PartySocket from "partysocket";
// import usePartySocket from "partysocket/react";
import {GameStore} from "@/store/game.ts";

export class SocketController {
    gameStore: GameStore;
    socket: PartySocket;

    constructor(gameStore: GameStore, room: string) {
        const myId = localStorage.getItem("socket_id");

        this.gameStore = gameStore;
        this.socket = new PartySocket({
            host: import.meta.env.VITE_PARTY_KIT_DOMAIN,
            room: room,
            id: myId ? myId : undefined,
        })
        this.socket.addEventListener("connect", () => this.gameStore.setMyId(this.socket.id))
        this.socket.addEventListener('message', (event: MessageEvent) => this.onMessage(event))
        // this.socket = usePartySocket({
        //     host: import.meta.env.VITE_PARTY_KIT_DOMAIN,
        //     room: room,
        //     id: myId ? myId : undefined,
        //
        //     onMessage: (event) => this.onMessage(event),
        //     onOpen: () => this.gameStore.setMyId(this.socket.id)
        // });

        localStorage.setItem("socket_id", this.socket.id);
    }

    onMessage(e: MessageEvent) {
        const event = JSON.parse(e.data) as TEvent

        if (event.type == 'sync') {
            this.gameStore.onSync(event)
        }
        if (event.type == 'edit_game_name') {
            this.gameStore.onEditGameName(event)
        }
        if (event.type == 'edit_my_name') {
            this.gameStore.onEditName(event)
        }
        if (event.type == 'join') {
            this.gameStore.onJoin(event)
        }
        if (event.type == 'spectator') {
            this.gameStore.onSpectator(event)
        }
        if (event.type == 'connect') {
            this.gameStore.onConnect(event)
        }
        if (event.type == 'leave') {
            this.gameStore.onLeave(event)
        }
        if (event.type == 'edit_my_avatar') {
            this.gameStore.onEditAvatar(event)
        }
        if (event.type == 'set_admin') {
            this.gameStore.onSetAdmin(event)
        }
        if (event.type == 'set_turn') {
            this.gameStore.onSetTurn(event)
        }
    }

    sendSetAdmin(id: string) {
        const event: TEventSetAdmin = {
            type: "set_admin",
            id: id,
        }
        this.socket.send(JSON.stringify(event))
    }

    sendEndTurn() {
        const event: TEventEntTurn = {
            type: "end_turn"
        }
        this.socket.send(JSON.stringify(event));
    }

    sendEditGameName(toId: string, newName: string) {
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
        console.log('sync')
        this.socket.send(JSON.stringify(event))
    }

    sendSpectator() {
        const event: TEventSpectator = {
            type: "spectator",
            id: this.socket.id,
        }
        this.socket.send(JSON.stringify(event))
    }

    sendMyName(name: string) {
        const event: TEventEditMyName = {
            type: "edit_my_name",
            id: this.socket.id,
            newName: name
        }
        this.socket.send(JSON.stringify(event))
    }

    sendMyAvatar(link: string) {
        const event: TEventEditMyAvatar = {
            type: "edit_my_avatar",
            id: this.socket.id,
            avatar: link
        }
        this.socket.send(JSON.stringify(event))
    }

    async uploadImg(formData: FormData) : Promise<string> {
        const res = await PartySocket.fetch({host: this.socket.host, room: this.socket.room || ''},
            {
                method: 'POST',
                body: formData
            },
        )
        const data = await res.json()
        return data.link
    }

}