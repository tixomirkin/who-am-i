import { describe, it, expect, beforeEach } from 'vitest';
import { GameStore } from '../game';
import type { TGameState, TEventSync } from '@who-am-i/shared';

describe('GameStore (MobX)', () => {
  let store: GameStore;

  beforeEach(() => {
    store = new GameStore();
  });

  it('initializes with empty state', () => {
    expect(store.myId).toBe('');
    expect(store.players).toEqual([]);
    expect(store.activePlayers).toEqual([]);
    expect(store.spectators).toEqual([]);
    expect(store.isMyTurn).toBe(false);
  });

  it('updates state upon receiving sync event', () => {
    const gameState: TGameState = {
      players: [
        {
          id: 'user-1',
          name: 'Alice',
          gameName: 'Sherlock',
          description: '',
          isAdmin: true,
          isSpectator: false,
          avatar: null,
        },
        {
          id: 'user-2',
          name: 'Bob',
          gameName: '',
          description: '',
          isAdmin: false,
          isSpectator: true,
          avatar: null,
        },
      ],
      round: 2,
      turnPlayerId: 'user-1',
      settings: { assignmentMode: 'free', allowSpectatorViewing: true },
    };

    store.setMyId('user-1');
    const syncEvent: TEventSync = { type: 'sync', game: gameState };
    store.onSync(syncEvent);

    expect(store.players).toHaveLength(2);
    expect(store.activePlayers).toHaveLength(1);
    expect(store.spectators).toHaveLength(1);
    expect(store.isMyTurn).toBe(true);
    expect(store.isGameAdmin).toBe(true);
    expect(store.turnPlayer?.name).toBe('Alice');
    expect(store.round).toBe(2);
    expect(store.settings.assignmentMode).toBe('free');
  });

  it('handles update_settings event', () => {
    store.onUpdateSettings({
      type: 'update_settings',
      id: 'admin',
      settings: { assignmentMode: 'neighbor_right' },
    });
    expect(store.settings.assignmentMode).toBe('neighbor_right');
  });

  it('handles player joining game and switching to spectator', () => {
    store.setMyId('user-1');
    store.onConnect({ type: 'connect', id: 'user-1' });

    expect(store.players[0].isSpectator).toBe(true);

    store.onJoin({ type: 'join', id: 'user-1' });
    expect(store.players[0].isSpectator).toBe(false);
    expect(store.activePlayers).toHaveLength(1);

    store.onSpectator({ type: 'spectator', id: 'user-1' });
    expect(store.players[0].isSpectator).toBe(true);
    expect(store.activePlayers).toHaveLength(0);
  });

  it('handles updating player name and character name', () => {
    store.onConnect({ type: 'connect', id: 'user-1' });
    store.onEditName({ type: 'edit_my_name', id: 'user-1', newName: 'Charlie' });
    expect(store.players[0].name).toBe('Charlie');
    expect(store.players[0].displayName).toBe('Charlie');

    store.onEditGameName({
      type: 'edit_game_name',
      id: 'admin',
      toId: 'user-1',
      newGameName: 'Batman',
    });
    expect(store.players[0].gameName).toBe('Batman');
  });

  it('handles player leave', () => {
    store.onConnect({ type: 'connect', id: 'user-1' });
    store.onConnect({ type: 'connect', id: 'user-2' });
    expect(store.players).toHaveLength(2);

    store.onLeave({ type: 'leave', id: 'user-1' });
    expect(store.players).toHaveLength(1);
    expect(store.players[0].id).toBe('user-2');
  });
});
