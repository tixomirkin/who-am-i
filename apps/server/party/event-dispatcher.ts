import type * as Party from 'partykit/server';
import type {
  TEvent,
  TEventConnect,
  TEventEditDescription,
  TEventEditGameName,
  TEventEditMyAvatar,
  TEventEditMyName,
  TEventJoin,
  TEventLeave,
  TEventSetAdmin,
  TEventSetTurn,
  TEventSpectator,
  TEventSync,
  TEventUpdateSettings,
} from '@who-am-i/shared';
import type { RoomStateManager } from './room-state';

export type MessageHandler<T extends TEvent = TEvent> = (
  event: T,
  sender: Party.Connection
) => void | Promise<void>;

/**
 * Dispatches incoming WebSocket messages to domain state mutations and broadcasts results.
 * Follows the Command Dispatcher / Action Pattern.
 */
export class GameEventDispatcher {
  private handlers: Map<TEvent['type'], MessageHandler<any>> = new Map();

  constructor(
    private readonly roomState: RoomStateManager,
    private readonly room: Party.Room
  ) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.handlers.set('get_sync', (_, sender) => {
      this.sendSync(sender);
    });

    this.handlers.set('join', (event: TEventJoin, sender) => {
      if (event.id !== sender.id) return;
      const res = this.roomState.joinGame(sender.id);
      if (res.success) {
        this.broadcast(event);
      }
    });

    this.handlers.set('spectator', (event: TEventSpectator, sender) => {
      if (event.id !== sender.id) return;
      const res = this.roomState.setSpectator(sender.id);
      if (res.success) {
        this.broadcast(event);
        if (res.data?.nextTurnPlayerId !== undefined) {
          const turnEvent: TEventSetTurn = {
            type: 'set_turn',
            id: res.data.nextTurnPlayerId ?? '',
          };
          this.broadcast(turnEvent);
        }
      }
    });

    this.handlers.set('edit_my_name', (event: TEventEditMyName, sender) => {
      if (event.id !== sender.id) return;
      const res = this.roomState.setPlayerName(sender.id, event.newName);
      if (res.success) {
        this.broadcast(event);
      }
    });

    this.handlers.set('edit_my_avatar', (event: TEventEditMyAvatar, sender) => {
      if (event.id !== sender.id) return;
      const res = this.roomState.setPlayerAvatar(sender.id, event.avatar);
      if (res.success) {
        this.broadcast(event);
      }
    });

    this.handlers.set('edit_description', (event: TEventEditDescription, sender) => {
      if (event.id !== sender.id) return;
      this.roomState.setPlayerDescription(sender.id, event.newDescription);
    });

    this.handlers.set('edit_game_name', (event: TEventEditGameName, sender) => {
      const res = this.roomState.setGameName(sender.id, event.toId, event.newGameName);
      if (res.success) {
        // Broadcast to all players so character changes update simultaneously across all screens
        this.broadcast(event);
      }
    });

    this.handlers.set('set_admin', (event: TEventSetAdmin, sender) => {
      const res = this.roomState.setAdmin(sender.id, event.id);
      if (res.success) {
        this.broadcast(event);
      }
    });

    this.handlers.set('update_settings', (event: TEventUpdateSettings, sender) => {
      const res = this.roomState.updateSettings(sender.id, event.settings);
      if (res.success) {
        this.broadcast(event);
      }
    });

    this.handlers.set('end_turn', (_, sender) => {
      const res = this.roomState.endTurn(sender.id);
      if (res.success && res.data?.nextTurnPlayerId) {
        const turnEvent: TEventSetTurn = {
          type: 'set_turn',
          id: res.data.nextTurnPlayerId,
        };
        this.broadcast(turnEvent);
      }
    });

    this.handlers.set('leave', (event: TEventLeave, sender) => {
      if (event.id !== sender.id) return;
      this.handlePlayerLeave(sender.id);
    });
  }

  public handleConnection(conn: Party.Connection): void {
    const { isFirstPlayer } = this.roomState.addPlayer(conn.id);

    const connectEvent: TEventConnect = {
      type: 'connect',
      id: conn.id,
    };
    this.room.broadcast(JSON.stringify(connectEvent), [conn.id]);

    this.sendSync(conn);

    if (isFirstPlayer) {
      const adminEvent: TEventSetAdmin = {
        type: 'set_admin',
        id: conn.id,
      };
      const turnEvent: TEventSetTurn = {
        type: 'set_turn',
        id: conn.id,
      };
      this.broadcast(adminEvent);
      this.broadcast(turnEvent);
    }
  }

  public handleDisconnect(conn: Party.Connection): void {
    this.handlePlayerLeave(conn.id);
  }

  public handlePlayerLeave(playerId: string): void {
    const { removed, newAdminId, newTurnPlayerId } = this.roomState.removePlayer(playerId);
    if (!removed) return;

    if (newAdminId) {
      const adminEvent: TEventSetAdmin = {
        type: 'set_admin',
        id: newAdminId,
      };
      this.broadcast(adminEvent);
    }

    if (newTurnPlayerId) {
      const turnEvent: TEventSetTurn = {
        type: 'set_turn',
        id: newTurnPlayerId,
      };
      this.broadcast(turnEvent);
    }

    const leaveEvent: TEventLeave = {
      type: 'leave',
      id: playerId,
    };
    this.broadcast(leaveEvent);
  }

  public async dispatch(rawMessage: string, sender: Party.Connection): Promise<void> {
    try {
      const event = JSON.parse(rawMessage) as TEvent;
      const handler = this.handlers.get(event.type);
      if (handler) {
        await handler(event, sender);
      } else {
        console.warn(`[Dispatcher] Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error('[Dispatcher] Error parsing or processing event:', err);
    }
  }

  public sendSync(conn: Party.Connection): void {
    const syncEvent: TEventSync = {
      type: 'sync',
      game: this.roomState.getState(),
    };
    conn.send(JSON.stringify(syncEvent));
  }

  private broadcast(event: TEvent, without: string[] = []): void {
    this.room.broadcast(JSON.stringify(event), without);
  }
}
