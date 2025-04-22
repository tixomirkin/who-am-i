import type {
    TEventConnect,
    TEventEditGameName,
    TEventJoin,
    TEventLeave,
    TEventSync,
    TPlayer, TEventEditMyAvatar, TEventSetAdmin, TEventSetTurn
} from "@/store/types";
import { makeAutoObservable, runInAction } from "mobx"
import {TEventEditMyName, TEventSpectator} from "@/store/types.ts";

export class Player {
    id: string;
    name: string = '';
    gameName: string = '';
    description: string = '';
    isAdmin: boolean = false;
    isSpectator: boolean = true;
    avatar: string | null = null;


    constructor(id: string) {
        makeAutoObservable(this)
        this.id = id
    }

    static fromTPlayer(fromPlayer: TPlayer) {
        const player = new Player(fromPlayer.id)
        player.name = fromPlayer.name
        player.gameName = fromPlayer.gameName
        player.description = fromPlayer.description
        player.isAdmin = fromPlayer.isAdmin
        player.isSpectator = fromPlayer.isSpectator
        player.avatar = fromPlayer.avatar
        return player
    }

    setId(id: string) { this.id = id; }
    setName(name: string) { this.name = name; }
    setGameName(gameName: string) { this.gameName = gameName; }
    setDescription(description: string) { this.description = description; }
    setIsAdmin(isAdmin: boolean) { this.isAdmin = isAdmin; }
    setIsSpectator(isSpectator: boolean) { this.isSpectator = isSpectator; }
    setAvatar(avatar: string | null) { this.avatar = avatar; }


}

export class GameStore {
    myId: string = '';
    players: Player[] = [];
    turnPlayerId: string | null = null;

    constructor() {
        makeAutoObservable(this)
    }

    setMyId(id: string) {
        this.myId = id
    }

    onSync(event: TEventSync) {
        runInAction(() => {
            console.log(this.myId)
            this.players = event.game.players.map((player: TPlayer) => Player.fromTPlayer(player))
            this.turnPlayerId = event.game.turnPlayerId
        })
    }

    onConnect(event: TEventConnect) {
        const player = this.players.find((player) => player.id === event.id)
        if (!player) {
            this.players.push(new Player(event.id))
        }
    }

    onJoin(event: TEventJoin) {
        const player = this.players.find((player) => player.id === event.id)
        if (player) {
            player.setIsSpectator(false)
        }
    }

    onLeave(event: TEventLeave) {
        this.players = this.players.filter((player: TPlayer) => player.id != event.id)
    }

    onEditGameName(event: TEventEditGameName) {
        const player = this.players.find((player) => player.id == event.toId)
        if (player) {
            player.setGameName(event.newGameName)
        }
    }

    onSpectator(event: TEventSpectator) {
        const player = this.players.find((player) => player.id === event.id)
        if (player) {
            player.setIsSpectator(true)
        }
    }

    onEditName(event: TEventEditMyName) {
        const player = this.players.find((player) => player.id === event.id)
        if (player) {
            player.setName(event.newName)
        }
    }

    onEditAvatar(event: TEventEditMyAvatar) {
        const player = this.players.find((player) => player.id === event.id)
        if (player) {
            player.setAvatar(event.avatar)
        }
    }

    onSetAdmin(event: TEventSetAdmin) {
        this.players.forEach((player) => {
            if (player.isAdmin) player.setIsAdmin(false)
            if (player.id == event.id) player.setIsAdmin(true)
        })
    }

    onSetTurn(event: TEventSetTurn) {
        console.log('onSetTurn', event)
        this.turnPlayerId = event.id
    }

}