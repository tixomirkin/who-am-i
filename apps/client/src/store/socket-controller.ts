import type {
  TEvent,
  TEventEditGameName,
  TEventEditMyAvatar,
  TEventEditMyName,
  TEventEntTurn,
  TEventGetSync,
  TEventJoin,
  TEventSetAdmin,
  TEventSpectator,
  TEventUpdateSettings,
  TGameSettings,
} from '@who-am-i/shared';
import PartySocket from 'partysocket';
import type { GameStore } from './game';

export class SocketController {
  readonly gameStore: GameStore;
  readonly socket: PartySocket;
  private isDestroyed = false;
  private messageQueue: TEvent[] = [];

  constructor(gameStore: GameStore, room: string) {
    const savedSocketId = localStorage.getItem('socket_id');

    this.gameStore = gameStore;
    this.socket = new PartySocket({
      host: import.meta.env.VITE_PARTY_KIT_DOMAIN || window.location.host,
      room,
      id: savedSocketId || undefined,
    });

    this.setupListeners();
    if (this.socket.id) {
      localStorage.setItem('socket_id', this.socket.id);
    }
  }

  private setupListeners(): void {
    this.socket.addEventListener('open', () => {
      if (this.isDestroyed) return;
      if (this.socket.id) {
        this.gameStore.setMyId(this.socket.id);
        localStorage.setItem('socket_id', this.socket.id);
      }

      // Automatically sync saved profile from localStorage upon entering any room
      const savedName = localStorage.getItem('game-name');
      const savedAvatar = localStorage.getItem('game-avatar');

      if (savedName && savedName.trim()) {
        this.sendMyName(savedName.trim());
      }
      if (savedAvatar) {
        this.sendMyAvatar(savedAvatar);
      }

      // Flush queued messages if any
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        if (msg) {
          this.socket.send(JSON.stringify(msg));
        }
      }
    });

    this.socket.addEventListener('message', (event: MessageEvent) => {
      if (this.isDestroyed) return;
      this.handleMessage(event);
    });
  }

  private handleMessage(e: MessageEvent): void {
    try {
      const event = JSON.parse(e.data) as TEvent;

      switch (event.type) {
        case 'sync':
          this.gameStore.onSync(event);
          // If my player was synced with empty name or avatar but we have saved profile, send it
          this.syncLocalProfileIfEmpty();
          break;
        case 'connect':
          this.gameStore.onConnect(event);
          break;
        case 'edit_game_name':
          this.gameStore.onEditGameName(event);
          break;
        case 'edit_my_name':
          this.gameStore.onEditName(event);
          break;
        case 'edit_my_avatar':
          this.gameStore.onEditAvatar(event);
          break;
        case 'join':
          this.gameStore.onJoin(event);
          break;
        case 'spectator':
          this.gameStore.onSpectator(event);
          break;
        case 'leave':
          this.gameStore.onLeave(event);
          break;
        case 'set_admin':
          this.gameStore.onSetAdmin(event);
          break;
        case 'set_turn':
          this.gameStore.onSetTurn(event);
          break;
        case 'update_settings':
          this.gameStore.onUpdateSettings(event);
          break;
      }
    } catch (err) {
      console.error('[SocketController] Error parsing message:', err);
    }
  }

  private syncLocalProfileIfEmpty(): void {
    const me = this.gameStore.me;
    if (!me) return;

    const savedName = localStorage.getItem('game-name');
    const savedAvatar = localStorage.getItem('game-avatar');

    if (savedName && (!me.name || me.name !== savedName)) {
      this.sendMyName(savedName);
    }
    if (savedAvatar && (!me.avatar || me.avatar !== savedAvatar)) {
      this.sendMyAvatar(savedAvatar);
    }
  }

  public sendSetAdmin(targetId: string): void {
    const event: TEventSetAdmin = {
      type: 'set_admin',
      id: targetId,
    };
    this.send(event);
  }

  public sendUpdateSettings(settings: Partial<TGameSettings>): void {
    const event: TEventUpdateSettings = {
      type: 'update_settings',
      id: this.socket.id,
      settings,
    };
    this.send(event);
    this.gameStore.onUpdateSettings(event);
  }

  public sendEndTurn(): void {
    const event: TEventEntTurn = {
      type: 'end_turn',
    };
    this.send(event);
  }

  public sendEditGameName(toId: string, newName: string): void {
    const event: TEventEditGameName = {
      type: 'edit_game_name',
      id: this.socket.id,
      toId,
      newGameName: newName,
    };
    this.send(event);
    this.gameStore.onEditGameName(event);
  }

  public sendJoin(): void {
    const event: TEventJoin = {
      type: 'join',
      id: this.socket.id,
    };
    this.send(event);
  }

  public sendSync(): void {
    const event: TEventGetSync = {
      type: 'get_sync',
    };
    this.send(event);
  }

  public sendSpectator(): void {
    const event: TEventSpectator = {
      type: 'spectator',
      id: this.socket.id,
    };
    this.send(event);
  }

  public sendMyName(name: string): void {
    const event: TEventEditMyName = {
      type: 'edit_my_name',
      id: this.socket.id,
      newName: name,
    };
    this.send(event);
    const me = this.gameStore.me;
    if (me) me.setName(name);
  }

  public sendMyAvatar(link: string | null): void {
    const event: TEventEditMyAvatar = {
      type: 'edit_my_avatar',
      id: this.socket.id,
      avatar: link,
    };
    this.send(event);
    const me = this.gameStore.me;
    if (me) me.setAvatar(link);
  }

  public async uploadImg(formData: FormData): Promise<string> {
    try {
      const res = await PartySocket.fetch(
        {
          host: this.socket.host,
          room: this.socket.room || '',
        },
        {
          method: 'POST',
          body: formData,
        }
      );

      if (res.ok) {
        const data = (await res.json()) as { link?: string; url?: string };
        if (data.link || data.url) {
          return data.link || data.url || '';
        }
      }
    } catch {
      // Fallback handled by caller
    }
    throw new Error('Upload fallback');
  }

  private send(event: TEvent): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
    } else {
      this.messageQueue.push(event);
    }
  }

  public disconnect(): void {
    this.isDestroyed = true;
    this.socket.close();
  }
}