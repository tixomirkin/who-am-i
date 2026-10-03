export interface TPlayer {
  id: string;
  name: string;
  gameName: string;
  description: string;
  isAdmin: boolean;
  isSpectator: boolean;
  avatar: string | null;
}

export type CharacterAssignmentMode = 'free' | 'neighbor_right' | 'neighbor_left' | 'admin_only';

export interface TGameSettings {
  assignmentMode: CharacterAssignmentMode;
  allowSpectatorViewing: boolean;
}

export const DEFAULT_GAME_SETTINGS: TGameSettings = {
  assignmentMode: 'free',
  allowSpectatorViewing: true,
};

export interface TGameState {
  players: TPlayer[];
  round: number; // Круг игры
  turnPlayerId: string | null;
  settings: TGameSettings;
}

export interface ImgurUploadResponse {
  link: string;
  id?: string;
  deletehash?: string;
  [key: string]: unknown;
}
