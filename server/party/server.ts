import type * as Party from "partykit/server";
import type {
  TEvent, TEventConnect,
  TEventEditDescription,
  TEventEditGameName, TEventEditMyAvatar,
  TEventEditMyName, TEventEntTurn,
  TEventJoin, TEventLeave, TEventSetAdmin, TEventSetTurn, TEventSpectator, TEventSync,
  TGameState,
  TPlayer
} from "./types";
import {arrayBufferToBase64, sendImgur} from "./imgur-uploader";


export default class Server implements Party.Server {
  count = 0;

  game: TGameState = {
    players: [],
    round: 0,
    turnPlayerId: null,
  };

  constructor(readonly room: Party.Room) {}


  async onRequest(req: Party.Request) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400', // 24 часа
        }
      });
    }

    if (req.method === "POST") {

        const formData = await req.formData();
        // @ts-ignore
        const file = formData.get('file') as File;

        if (!file) {
          return new Response('No file uploaded', { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
          return new Response('Only image files are allowed', { status: 400 });
        }

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_SIZE) {
          return new Response(`File exceeds ${MAX_SIZE/1024/1024}MB limit`, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64String = arrayBufferToBase64(arrayBuffer);
        const response = await sendImgur(base64String)

        if (!response.success) {
          console.error('Imgur API Error:', response);
          return new Response('Imgur upload failed', { status: 500 });
        }

        return new Response(JSON.stringify(response.data), {
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ status: 400 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    this.game.players.push({
      id: conn.id,
      name: '',
      gameName: '',
      description: '',
      isAdmin: false,
      isSpectator: true,
      avatar: null
    })

    const conEvent: TEventConnect = {
      type: "connect",
      id: conn.id,
    }
    this.room.broadcast(JSON.stringify(conEvent), [conn.id])

    this.onSync(conn)

    if (this.game.players.length == 1) {
      this.game.players[0].isAdmin = true;
      this.game.turnPlayerId = conn.id;
      const event1: TEventSetAdmin = {
        type: 'set_admin',
        id: conn.id,
      }
      const event2: TEventSetTurn = {
        type: 'set_turn',
        id: conn.id,
      }
      this.room.broadcast(JSON.stringify(event1));
      this.room.broadcast(JSON.stringify(event2));
    }
  }

  onClose(conn: Party.Connection) {
    const player = this.game.players.find(player => player.id === conn.id);
    if (player) {
      if (this.game.turnPlayerId == conn.id) {
          this.endTurn({type: 'end_turn', id: conn.id}, conn)
      }

      this.game.players = this.game.players.filter(player => player.id !== conn.id);

      if (player.isAdmin && this.game.players.length >= 1) {
        const event1: TEventSetAdmin = {
          type: "set_admin",
          id: this.game.players[0].id,
        }
        this.setAdmin(event1, conn)
      }

      const event: TEventLeave = {
        type: 'leave',
        id: conn.id,
      }
      this.leave(event, conn)

    }
  }

  onMessage(message: string, sender: Party.Connection) {

    console.log('test')
    const event = JSON.parse(message) as TEvent;

    if (event.type === "edit_my_name") {
      if (event.newName.length < 50 && event.newName.length > 3) this.editMyName(event, sender);
    }
    else if (event.type === "edit_game_name") {
      if (event.newGameName.length < 50) this.editGameName(event, sender);
    }
    else if (event.type === "edit_description") {
      if (event.newDescription.length < 100) this.editDescription(event, sender);
    }
    else if (event.type === "leave") {
      this.leave(event, sender);
    }
    else if (event.type === "end_turn") {
      this.endTurn(event, sender);
    }
    else if (event.type === "join") {
      this.join(event, sender);
    }
    else if (event.type === "set_admin") {
      this.setAdmin(event, sender);
    }
    else if (event.type === "spectator") {
      this.toSpectator(event, sender);
    }
    else if (event.type === "get_sync") {
      this.onSync(sender);
    }
    else if (event.type === "edit_my_avatar") {
      this.editMyAvatar(event, sender);
    }

  }


  editMyAvatar(event: TEventEditMyAvatar, con: Party.Connection) {
    const player = this.game.players.find(player => player.id === con.id);
    console.error("AVATRA")
    if (player && player.id === event.id) {
      player.avatar = event.avatar;
      console.error("AVATRA2")
      this.room.broadcast(JSON.stringify(event));
    }
  }


  editMyName(event: TEventEditMyName, con: Party.Connection) {
    const player = this.game.players.find(player => player.id === con.id);

    if (player && player.id === event.id) {
      player.name = event.newName;
      this.room.broadcast(JSON.stringify(event));
    }
  }

  editGameName(event: TEventEditGameName, con: Party.Connection) {
    const toPlayer = this.game.players.find(player => player.id === event.toId);
    const fromPlayer = this.game.players.find(player => player.id === con.id);
    if (toPlayer && fromPlayer && !fromPlayer.isSpectator && !toPlayer.isSpectator && fromPlayer.id != toPlayer.id && event.id == con.id) {
      toPlayer.gameName = event.newGameName;
      this.room.broadcast(JSON.stringify(event), [con.id]);
    }
  }

  editDescription(event: TEventEditDescription, con: Party.Connection) {
    const player = this.game.players.find(player => player.id === con.id);
    if (player) {
      player.description = event.newDescription;
    }
  }

  join(event: TEventJoin, con: Party.Connection) {
    const player = this.game.players.find(player => player.id === con.id);
    if (player && player.id === event.id) {
      player.isSpectator = false;
      this.room.broadcast(JSON.stringify(event));
    }
  }

  toSpectator(event: TEventSpectator, con: Party.Connection) {
    const player = this.game.players.find(player => player.id === con.id);
    if (player && player.id === event.id) {
      player.isSpectator = true;
      this.room.broadcast(JSON.stringify(event));
    }
  }

  setAdmin(event: TEventSetAdmin, con: Party.Connection) {
    const fromPlayer = this.game.players.find(player => player.id === con.id);
    const toPlayer = this.game.players.find(player => player.id === event.id);

    if (fromPlayer && toPlayer && fromPlayer.isAdmin) {
      fromPlayer.isAdmin = false;
      toPlayer.isAdmin = true;
      this.room.broadcast(JSON.stringify(event));
    }
  }

  endTurn(event: TEventEntTurn, con: Party.Connection) {
    if (this.game.turnPlayerId == con.id && con.id == event.id) {
      let turnIndex = 0;
      const playerIndex = this.game.players.findIndex((player) => player.id === con.id);
      if (playerIndex + 1 != this.game.players.length) {
        turnIndex = playerIndex + 1
      }
      this.game.turnPlayerId = this.game.players[playerIndex].id
      this.room.broadcast(JSON.stringify(event));
    }
  }

  leave(event: TEventLeave, con: Party.Connection) {
    if (event.id == con.id) {
      this.room.broadcast(JSON.stringify(event));
    }
  }

  onSync(con: Party.Connection) {
    const event: TEventSync = {
      type: 'sync',
      game: this.game,
    }
    con.send(JSON.stringify(event));
  }

}

Server satisfies Party.Worker;
