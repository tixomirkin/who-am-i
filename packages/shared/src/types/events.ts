import type { TGameState, TGameSettings } from './game';

export interface TEventSync {
  type: 'sync';
  game: TGameState;
}

export interface TEventGetSync {
  type: 'get_sync';
}

export interface TEventEntTurn {
  type: 'end_turn';
}

export interface TEventEditMyName {
  type: 'edit_my_name';
  id: string;
  newName: string;
}

export interface TEventEditMyAvatar {
  type: 'edit_my_avatar';
  id: string;
  avatar: string | null;
}

export interface TEventEditGameName {
  type: 'edit_game_name';
  id: string;
  toId: string;
  newGameName: string;
}

export interface TEventEditDescription {
  type: 'edit_description';
  id: string;
  newDescription: string;
}

export interface TEventJoin {
  type: 'join';
  id: string;
}

export interface TEventConnect {
  type: 'connect';
  id: string;
}

export interface TEventSpectator {
  type: 'spectator';
  id: string;
}

export interface TEventSetAdmin {
  type: 'set_admin';
  id: string;
}

export interface TEventLeave {
  type: 'leave';
  id: string;
}

export interface TEventSetTurn {
  type: 'set_turn';
  id: string;
}

export interface TEventUpdateSettings {
  type: 'update_settings';
  id: string;
  settings: Partial<TGameSettings>;
}

export type TEvent =
  | TEventSync
  | TEventEntTurn
  | TEventEditMyName
  | TEventEditGameName
  | TEventEditDescription
  | TEventJoin
  | TEventSpectator
  | TEventSetAdmin
  | TEventLeave
  | TEventConnect
  | TEventGetSync
  | TEventEditMyAvatar
  | TEventSetTurn
  | TEventUpdateSettings;
