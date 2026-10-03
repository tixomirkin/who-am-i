import { describe, it, expect, beforeEach } from 'vitest';
import { RoomStateManager } from '../room-state';

describe('RoomStateManager', () => {
  let room: RoomStateManager;

  beforeEach(() => {
    room = new RoomStateManager();
  });

  describe('Player connections and Admin assignment', () => {
    it('sets the first connecting player as admin and assigns turn', () => {
      const { player, isFirstPlayer } = room.addPlayer('conn-1');
      expect(isFirstPlayer).toBe(true);
      expect(player.id).toBe('conn-1');
      expect(player.isAdmin).toBe(true);
      expect(player.isSpectator).toBe(true);

      const state = room.getState();
      expect(state.turnPlayerId).toBe('conn-1');
      expect(state.players).toHaveLength(1);
    });

    it('subsequent connecting players are not admin', () => {
      room.addPlayer('conn-1');
      const { player, isFirstPlayer } = room.addPlayer('conn-2');

      expect(isFirstPlayer).toBe(false);
      expect(player.id).toBe('conn-2');
      expect(player.isAdmin).toBe(false);

      const state = room.getState();
      expect(state.turnPlayerId).toBe('conn-1');
      expect(state.players).toHaveLength(2);
    });

    it('handles player reconnection gracefully without duplicates', () => {
      room.addPlayer('conn-1');
      room.setPlayerName('conn-1', 'Alex');
      const { player } = room.addPlayer('conn-1');

      expect(player.name).toBe('Alex');
      expect(room.getState().players).toHaveLength(1);
    });
  });

  describe('Player profile updates', () => {
    beforeEach(() => {
      room.addPlayer('conn-1');
    });

    it('updates player name with valid input', () => {
      const result = room.setPlayerName('conn-1', 'Alice');
      expect(result.success).toBe(true);
      expect(room.getPlayer('conn-1')?.name).toBe('Alice');
    });

    it('rejects invalid names', () => {
      const resultEmpty = room.setPlayerName('conn-1', '');
      expect(resultEmpty.success).toBe(false);

      const resultLong = room.setPlayerName('conn-1', 'a'.repeat(60));
      expect(resultLong.success).toBe(false);
    });

    it('updates avatar and description', () => {
      room.setPlayerAvatar('conn-1', 'https://imgur.com/image.png');
      expect(room.getPlayer('conn-1')?.avatar).toBe('https://imgur.com/image.png');

      room.setPlayerDescription('conn-1', 'My bio');
      expect(room.getPlayer('conn-1')?.description).toBe('My bio');
    });
  });

  describe('Game mechanics: Join, Spectate, and Character Assignment', () => {
    beforeEach(() => {
      room.addPlayer('p1');
      room.addPlayer('p2');
    });

    it('allows players to join and leave active game', () => {
      room.joinGame('p1');
      expect(room.getPlayer('p1')?.isSpectator).toBe(false);
      expect(room.getActivePlayers()).toHaveLength(1);

      room.setSpectator('p1');
      expect(room.getPlayer('p1')?.isSpectator).toBe(true);
      expect(room.getActivePlayers()).toHaveLength(0);
    });

    it('prevents spectators from assigning character names', () => {
      const res = room.setGameName('p1', 'p2', 'Harry Potter');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Spectators cannot');
    });

    it('prevents setting character name for oneself', () => {
      room.joinGame('p1');
      const res = room.setGameName('p1', 'p1', 'Harry Potter');
      expect(res.success).toBe(false);
      expect(res.error).toContain('yourself');
    });

    it('allows active players to assign character name to another active player', () => {
      room.joinGame('p1');
      room.joinGame('p2');

      const res = room.setGameName('p1', 'p2', 'Spider-Man');
      expect(res.success).toBe(true);
      expect(room.getPlayer('p2')?.gameName).toBe('Spider-Man');
    });
  });

  describe('Turn Rotation and Admin Reassignment', () => {
    beforeEach(() => {
      room.addPlayer('p1');
      room.addPlayer('p2');
      room.addPlayer('p3');
      room.joinGame('p1');
      room.joinGame('p2');
      room.joinGame('p3');
    });

    it('rotates turns circularly among active players', () => {
      expect(room.getState().turnPlayerId).toBe('p1');

      const turn1 = room.endTurn('p1');
      expect(turn1.success).toBe(true);
      expect(turn1.data?.nextTurnPlayerId).toBe('p2');
      expect(room.getState().turnPlayerId).toBe('p2');

      const turn2 = room.endTurn('p2');
      expect(turn2.success).toBe(true);
      expect(turn2.data?.nextTurnPlayerId).toBe('p3');

      const turn3 = room.endTurn('p3');
      expect(turn3.success).toBe(true);
      expect(turn3.data?.nextTurnPlayerId).toBe('p1');
      expect(room.getState().round).toBe(1);
    });

    it('rejects ending turn if not sender turn', () => {
      const res = room.endTurn('p2');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Not your turn');
    });

    it('reassigns admin and turn if admin leaves', () => {
      const removeResult = room.removePlayer('p1');
      expect(removeResult.removed).toBe(true);
      expect(removeResult.newAdminId).toBe('p2');
      expect(removeResult.newTurnPlayerId).toBe('p2');

      const state = room.getState();
      expect(state.players).toHaveLength(2);
      expect(room.getPlayer('p2')?.isAdmin).toBe(true);
      expect(state.turnPlayerId).toBe('p2');
    });

    it('allows admin transfer explicitly', () => {
      const res = room.setAdmin('p1', 'p3');
      expect(res.success).toBe(true);
      expect(room.getPlayer('p1')?.isAdmin).toBe(false);
      expect(room.getPlayer('p3')?.isAdmin).toBe(true);
    });

    it('rejects admin transfer from non-admin', () => {
      const res = room.setAdmin('p2', 'p3');
      expect(res.success).toBe(false);
    });
  });

  describe('Game Settings & Assignment Modes', () => {
    beforeEach(() => {
      room.addPlayer('p1');
      room.addPlayer('p2');
      room.addPlayer('p3');
      room.joinGame('p1');
      room.joinGame('p2');
      room.joinGame('p3');
    });

    it('allows admin to update room settings', () => {
      const res = room.updateSettings('p1', { assignmentMode: 'neighbor_right' });
      expect(res.success).toBe(true);
      expect(room.getState().settings.assignmentMode).toBe('neighbor_right');
    });

    it('rejects non-admin from updating room settings', () => {
      const res = room.updateSettings('p2', { assignmentMode: 'admin_only' });
      expect(res.success).toBe(false);
    });

    it('enforces neighbor_right mode in setGameName', () => {
      room.updateSettings('p1', { assignmentMode: 'neighbor_right' });
      // p1 -> p2 is valid
      expect(room.setGameName('p1', 'p2', 'Batman').success).toBe(true);
      // p1 -> p3 is invalid in neighbor_right
      expect(room.setGameName('p1', 'p3', 'Superman').success).toBe(false);
    });
  });
});
