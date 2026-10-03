import type { TGameState, TPlayer, TGameSettings } from '@who-am-i/shared';
import {
  validatePlayerName,
  validateGameName,
  validateDescription,
  canAssignCharacter,
  DEFAULT_GAME_SETTINGS,
} from '@who-am-i/shared';

export interface StateChangeResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Encapsulates the domain logic and state transitions for a single game room.
 * Pure TypeScript logic with zero external runtime dependencies for maximum testability.
 */
export class RoomStateManager {
  private state: TGameState = {
    players: [],
    round: 0,
    turnPlayerId: null,
    settings: { ...DEFAULT_GAME_SETTINGS },
  };

  constructor(initialState?: Partial<TGameState>) {
    if (initialState) {
      this.state = {
        players: initialState.players ?? [],
        round: initialState.round ?? 0,
        turnPlayerId: initialState.turnPlayerId ?? null,
        settings: { ...DEFAULT_GAME_SETTINGS, ...(initialState.settings ?? {}) },
      };
    }
  }

  public getState(): TGameState {
    return {
      players: this.state.players.map((p) => ({ ...p })),
      round: this.state.round,
      turnPlayerId: this.state.turnPlayerId,
      settings: { ...this.state.settings },
    };
  }

  public getPlayer(id: string): TPlayer | undefined {
    return this.state.players.find((p) => p.id === id);
  }

  public getActivePlayers(): TPlayer[] {
    return this.state.players.filter((p) => !p.isSpectator);
  }

  public getSpectators(): TPlayer[] {
    return this.state.players.filter((p) => p.isSpectator);
  }

  /**
   * Connect a new or returning player.
   * If this is the first player in the room, they automatically become admin and get first turn.
   */
  public addPlayer(id: string): { player: TPlayer; isFirstPlayer: boolean } {
    let player = this.getPlayer(id);
    if (!player) {
      player = {
        id,
        name: '',
        gameName: '',
        description: '',
        isAdmin: false,
        isSpectator: true,
        avatar: null,
      };
      this.state.players.push(player);
    }

    const isFirstPlayer = this.state.players.length === 1;
    if (isFirstPlayer) {
      player.isAdmin = true;
      this.state.turnPlayerId = id;
    }

    return { player: { ...player }, isFirstPlayer };
  }

  /**
   * Handle player disconnect/leaving.
   * Cleans up turn and admin assignments if the leaving player held those roles.
   */
  public removePlayer(id: string): {
    removed: boolean;
    newAdminId: string | null;
    newTurnPlayerId: string | null;
  } {
    const playerIndex = this.state.players.findIndex((p) => p.id === id);
    if (playerIndex === -1) {
      return { removed: false, newAdminId: null, newTurnPlayerId: null };
    }

    const player = this.state.players[playerIndex];
    const wasAdmin = player.isAdmin;
    const wasTurn = this.state.turnPlayerId === id;

    // Advance turn before removing player
    let newTurnPlayerId: string | null = null;
    if (wasTurn) {
      const activePlayers = this.getActivePlayers().filter((p) => p.id !== id);
      if (activePlayers.length > 0) {
        newTurnPlayerId = activePlayers[0].id;
      }
      this.state.turnPlayerId = newTurnPlayerId;
    }

    this.state.players.splice(playerIndex, 1);

    // Reassign admin if needed
    let newAdminId: string | null = null;
    if (wasAdmin && this.state.players.length > 0) {
      const activePlayers = this.getActivePlayers();
      const nextAdmin = activePlayers.length > 0 ? activePlayers[0] : this.state.players[0];
      nextAdmin.isAdmin = true;
      newAdminId = nextAdmin.id;
    }

    return { removed: true, newAdminId, newTurnPlayerId };
  }

  public setPlayerName(id: string, newName: string): StateChangeResult {
    const validation = validatePlayerName(newName);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const player = this.getPlayer(id);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.name = newName.trim();
    return { success: true };
  }

  public setPlayerAvatar(id: string, avatarUrl: string | null): StateChangeResult {
    const player = this.getPlayer(id);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.avatar = avatarUrl;
    return { success: true };
  }

  public setPlayerDescription(id: string, description: string): StateChangeResult {
    const validation = validateDescription(description);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const player = this.getPlayer(id);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.description = description;
    return { success: true };
  }

  /**
   * Assign character/secret name to another player.
   * Checks room rules and assignment mode (free, neighbor_right, neighbor_left, admin_only).
   */
  public setGameName(fromId: string, toId: string, newGameName: string): StateChangeResult {
    const validation = validateGameName(newGameName);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (fromId === toId) {
      return { success: false, error: 'Cannot set character name for yourself' };
    }

    const fromPlayer = this.getPlayer(fromId);
    const toPlayer = this.getPlayer(toId);

    if (!fromPlayer || !toPlayer) {
      return { success: false, error: 'Player not found' };
    }

    if (fromPlayer.isSpectator || toPlayer.isSpectator) {
      return { success: false, error: 'Spectators cannot assign or receive character names' };
    }

    if (!canAssignCharacter(fromId, toId, this.state)) {
      return {
        success: false,
        error: 'Character assignment not allowed for this player under current game settings',
      };
    }

    toPlayer.gameName = newGameName;
    return { success: true };
  }

  public updateSettings(
    senderId: string,
    newSettings: Partial<TGameSettings>
  ): StateChangeResult<TGameSettings> {
    const player = this.getPlayer(senderId);
    if (!player || !player.isAdmin) {
      return { success: false, error: 'Only admin can modify game settings' };
    }

    this.state.settings = {
      ...this.state.settings,
      ...newSettings,
    };

    return { success: true, data: { ...this.state.settings } };
  }

  public joinGame(id: string): StateChangeResult {
    const player = this.getPlayer(id);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.isSpectator = false;

    if (!this.state.turnPlayerId) {
      this.state.turnPlayerId = id;
    }

    return { success: true };
  }

  public setSpectator(id: string): StateChangeResult<{ nextTurnPlayerId?: string | null }> {
    const player = this.getPlayer(id);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    player.isSpectator = true;

    let nextTurnPlayerId: string | null | undefined = undefined;
    if (this.state.turnPlayerId === id) {
      const activePlayers = this.getActivePlayers();
      this.state.turnPlayerId = activePlayers.length > 0 ? activePlayers[0].id : null;
      nextTurnPlayerId = this.state.turnPlayerId;
    }

    return { success: true, data: { nextTurnPlayerId } };
  }

  public setAdmin(fromId: string, targetId: string): StateChangeResult {
    const fromPlayer = this.getPlayer(fromId);
    const toPlayer = this.getPlayer(targetId);

    if (!fromPlayer || !toPlayer) {
      return { success: false, error: 'Player not found' };
    }

    if (!fromPlayer.isAdmin) {
      return { success: false, error: 'Only admin can transfer admin rights' };
    }

    fromPlayer.isAdmin = false;
    toPlayer.isAdmin = true;
    return { success: true };
  }

  /**
   * Advance turn in circular order among active (non-spectator) players.
   */
  public endTurn(senderId: string): StateChangeResult<{ nextTurnPlayerId: string | null }> {
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length === 0) {
      this.state.turnPlayerId = null;
      return { success: true, data: { nextTurnPlayerId: null } };
    }

    if (this.state.turnPlayerId !== senderId) {
      return { success: false, error: 'Not your turn' };
    }

    const currentIndex = activePlayers.findIndex((p) => p.id === senderId);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % activePlayers.length : 0;
    const nextPlayer = activePlayers[nextIndex];

    this.state.turnPlayerId = nextPlayer.id;

    if (nextIndex === 0 && currentIndex !== -1) {
      this.state.round += 1;
    }

    return { success: true, data: { nextTurnPlayerId: this.state.turnPlayerId } };
  }
}
