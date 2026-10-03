import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEventDispatcher } from '../event-dispatcher';
import { RoomStateManager } from '../room-state';
import type * as Party from 'partykit/server';

describe('GameEventDispatcher', () => {
  let roomState: RoomStateManager;
  let mockRoom: Party.Room;
  let dispatcher: GameEventDispatcher;
  let mockConnection1: Party.Connection;
  let mockConnection2: Party.Connection;

  beforeEach(() => {
    roomState = new RoomStateManager();

    mockRoom = {
      id: 'test-room',
      broadcast: vi.fn(),
    } as unknown as Party.Room;

    dispatcher = new GameEventDispatcher(roomState, mockRoom);

    mockConnection1 = {
      id: 'conn-1',
      send: vi.fn(),
    } as unknown as Party.Connection;

    mockConnection2 = {
      id: 'conn-2',
      send: vi.fn(),
    } as unknown as Party.Connection;
  });

  it('handles client connection, assigns admin to first user and sends sync', () => {
    dispatcher.handleConnection(mockConnection1);

    expect(mockConnection1.send).toHaveBeenCalled();
    const sentSync = JSON.parse((mockConnection1.send as any).mock.calls[0][0]);
    expect(sentSync.type).toBe('sync');
    expect(sentSync.game.players).toHaveLength(1);
    expect(sentSync.game.players[0].isAdmin).toBe(true);

    expect(mockRoom.broadcast).toHaveBeenCalled();
  });

  it('handles join event and broadcasts to room', async () => {
    dispatcher.handleConnection(mockConnection1);
    vi.clearAllMocks();

    const joinEvent = JSON.stringify({ type: 'join', id: 'conn-1' });
    await dispatcher.dispatch(joinEvent, mockConnection1);

    expect(mockRoom.broadcast).toHaveBeenCalledWith(
      JSON.stringify({ type: 'join', id: 'conn-1' }),
      []
    );
    expect(roomState.getPlayer('conn-1')?.isSpectator).toBe(false);
  });

  it('handles edit_my_name event', async () => {
    dispatcher.handleConnection(mockConnection1);
    vi.clearAllMocks();

    const nameEvent = JSON.stringify({
      type: 'edit_my_name',
      id: 'conn-1',
      newName: 'SuperPlayer',
    });
    await dispatcher.dispatch(nameEvent, mockConnection1);

    expect(roomState.getPlayer('conn-1')?.name).toBe('SuperPlayer');
    expect(mockRoom.broadcast).toHaveBeenCalledWith(nameEvent, []);
  });

  it('handles edit_game_name event and broadcasts excluding sender', async () => {
    dispatcher.handleConnection(mockConnection1);
    dispatcher.handleConnection(mockConnection2);
    roomState.joinGame('conn-1');
    roomState.joinGame('conn-2');
    vi.clearAllMocks();

    const editGameNameEvent = JSON.stringify({
      type: 'edit_game_name',
      id: 'conn-1',
      toId: 'conn-2',
      newGameName: 'Sherlock Holmes',
    });
    await dispatcher.dispatch(editGameNameEvent, mockConnection1);

    expect(roomState.getPlayer('conn-2')?.gameName).toBe('Sherlock Holmes');
    expect(mockRoom.broadcast).toHaveBeenCalledWith(editGameNameEvent, []);
  });

  it('handles player disconnect and promotes new admin if admin left', () => {
    dispatcher.handleConnection(mockConnection1);
    dispatcher.handleConnection(mockConnection2);
    vi.clearAllMocks();

    dispatcher.handleDisconnect(mockConnection1);

    expect(roomState.getPlayer('conn-2')?.isAdmin).toBe(true);
    expect(mockRoom.broadcast).toHaveBeenCalledWith(
      JSON.stringify({ type: 'set_admin', id: 'conn-2' }),
      []
    );
    expect(mockRoom.broadcast).toHaveBeenCalledWith(
      JSON.stringify({ type: 'leave', id: 'conn-1' }),
      []
    );
  });
});
