import { makeAutoObservable, runInAction } from 'mobx';
import type {
  TEventConnect,
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
  TPlayer,
  TGameSettings,
  TGameState,
} from '@who-am-i/shared';
import { DEFAULT_GAME_SETTINGS, canAssignCharacter } from '@who-am-i/shared';

export class Player {
  id: string;
  name: string = '';
  gameName: string = '';
  description: string = '';
  isAdmin: boolean = false;
  isSpectator: boolean = true;
  avatar: string | null = null;

  constructor(id: string) {
    this.id = id;
    makeAutoObservable(this);
  }

  static fromTPlayer(data: TPlayer): Player {
    const player = new Player(data.id);
    player.name = data.name || '';
    player.gameName = data.gameName || '';
    player.description = data.description || '';
    player.isAdmin = Boolean(data.isAdmin);
    player.isSpectator = Boolean(data.isSpectator);
    player.avatar = data.avatar || null;
    return player;
  }

  toTPlayer(): TPlayer {
    return {
      id: this.id,
      name: this.name,
      gameName: this.gameName,
      description: this.description,
      isAdmin: this.isAdmin,
      isSpectator: this.isSpectator,
      avatar: this.avatar,
    };
  }

  get displayName(): string {
    return this.name.trim().length > 0 ? this.name : `Player #${this.id.slice(0, 4)}`;
  }

  get initials(): string {
    if (!this.name.trim()) return 'P';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.name.slice(0, 2).toUpperCase();
  }

  setName(name: string): void {
    this.name = name;
  }

  setGameName(gameName: string): void {
    this.gameName = gameName;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  setIsAdmin(isAdmin: boolean): void {
    this.isAdmin = isAdmin;
  }

  setIsSpectator(isSpectator: boolean): void {
    this.isSpectator = isSpectator;
  }

  setAvatar(avatar: string | null): void {
    this.avatar = avatar;
  }
}

export class GameStore {
  myId: string = '';
  players: Player[] = [];
  turnPlayerId: string | null = null;
  round: number = 0; // Круг
  settings: TGameSettings = { ...DEFAULT_GAME_SETTINGS };

  constructor() {
    makeAutoObservable(this);
  }

  get me(): Player | undefined {
    return this.players.find((p) => p.id === this.myId);
  }

  get activePlayers(): Player[] {
    return this.players.filter((p) => !p.isSpectator);
  }

  get spectators(): Player[] {
    return this.players.filter((p) => p.isSpectator);
  }

  get isMyTurn(): boolean {
    return Boolean(this.myId && this.turnPlayerId === this.myId);
  }

  get turnPlayer(): Player | undefined {
    return this.players.find((p) => p.id === this.turnPlayerId);
  }

  get isGameAdmin(): boolean {
    return Boolean(this.me?.isAdmin);
  }

  toGameState(): TGameState {
    return {
      players: this.players.map((p) => p.toTPlayer()),
      round: this.round,
      turnPlayerId: this.turnPlayerId,
      settings: { ...this.settings },
    };
  }

  canEditCharacterFor(targetPlayerId: string): boolean {
    if (!this.myId) return false;
    return canAssignCharacter(this.myId, targetPlayerId, this.toGameState());
  }

  /**
   * Helper to return the player who is assigned to set my character
   */
  get assignedAuthorForMe(): Player | undefined {
    if (!this.me || this.me.isSpectator) return undefined;
    const mode = this.settings.assignmentMode;
    const active = this.activePlayers;

    if (mode === 'admin_only') {
      return this.players.find((p) => p.isAdmin);
    }

    const myIndex = active.findIndex((p) => p.id === this.myId);
    if (myIndex === -1) return undefined;

    if (mode === 'neighbor_right') {
      // The person who assigns to me is the person to my left: (myIndex - 1 + len) % len
      const authorIndex = (myIndex - 1 + active.length) % active.length;
      return active[authorIndex];
    }

    if (mode === 'neighbor_left') {
      // The person who assigns to me is the person to my right: (myIndex + 1) % len
      const authorIndex = (myIndex + 1) % active.length;
      return active[authorIndex];
    }

    return undefined;
  }

  setMyId(id: string): void {
    this.myId = id;
  }

  onSync(event: TEventSync): void {
    runInAction(() => {
      this.players = event.game.players.map((p) => Player.fromTPlayer(p));
      this.turnPlayerId = event.game.turnPlayerId;
      this.round = event.game.round;
      if (event.game.settings) {
        this.settings = { ...DEFAULT_GAME_SETTINGS, ...event.game.settings };
      }
    });
  }

  onConnect(event: TEventConnect): void {
    const existing = this.players.find((p) => p.id === event.id);
    if (!existing) {
      this.players.push(new Player(event.id));
    }
  }

  onJoin(event: TEventJoin): void {
    const player = this.players.find((p) => p.id === event.id);
    if (player) {
      player.setIsSpectator(false);
    }
  }

  onSpectator(event: TEventSpectator): void {
    const player = this.players.find((p) => p.id === event.id);
    if (player) {
      player.setIsSpectator(true);
    }
  }

  onLeave(event: TEventLeave): void {
    this.players = this.players.filter((p) => p.id !== event.id);
  }

  onEditGameName(event: TEventEditGameName): void {
    const target = this.players.find((p) => p.id === event.toId);
    if (target) {
      target.setGameName(event.newGameName);
    }
  }

  onEditName(event: TEventEditMyName): void {
    const player = this.players.find((p) => p.id === event.id);
    if (player) {
      player.setName(event.newName);
    }
  }

  onEditAvatar(event: TEventEditMyAvatar): void {
    const player = this.players.find((p) => p.id === event.id);
    if (player) {
      player.setAvatar(event.avatar);
    }
  }

  onSetAdmin(event: TEventSetAdmin): void {
    this.players.forEach((player) => {
      player.setIsAdmin(player.id === event.id);
    });
  }

  onSetTurn(event: TEventSetTurn): void {
    this.turnPlayerId = event.id;
    if (event.round !== undefined) {
      this.round = event.round;
    }
  }

  onUpdateSettings(event: TEventUpdateSettings): void {
    runInAction(() => {
      this.settings = {
        ...this.settings,
        ...event.settings,
      };
    });
  }
}