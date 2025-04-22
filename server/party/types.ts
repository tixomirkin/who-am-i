export type TPlayer = {
    id: string,
    name: string,
    gameName: string,
    description: string,
    isAdmin: boolean,
    isSpectator: boolean,
    avatar: string | null,
}

export type TGameState = {
    players: TPlayer[]
    round: number,
    turnPlayerId: string | null,
}

export type TEventSync = {
    type: 'sync',
    game: TGameState,
}

export type TEventGetSync = {
    type: 'get_sync',
}

export type TEventEntTurn = {
    type: 'end_turn',
}

export type TEventEditMyName = {
    type: 'edit_my_name',
    id: string
    newName: string
}

export type TEventEditMyAvatar = {
    type: 'edit_my_avatar',
    id: string,
    avatar: string | null,
}

export type TEventEditGameName = {
    type: 'edit_game_name',
    id: string
    toId: string
    newGameName: string
}

export type TEventEditDescription = {
    type: 'edit_description',
    id: string
    newDescription: string
}

export type TEventJoin = {
    type: 'join',
    id: string,
    // name: string,
}

export type TEventConnect = {
    type: 'connect',
    id: string,
}

export type TEventSpectator = {
    type: 'spectator',
    id: string,
}

export type TEventSetAdmin = {
    type: 'set_admin',
    id: string,
}

export type TEventLeave = {
    type: 'leave',
    id: string,
}

export type TEventSetTurn = {
    type: 'set_turn',
    id: string,
}


export type TEvent = TEventSync | TEventEntTurn | TEventEditMyName | TEventEditGameName | TEventEditDescription | TEventJoin | TEventSpectator | TEventSetAdmin | TEventLeave | TEventConnect | TEventGetSync | TEventEditMyAvatar



