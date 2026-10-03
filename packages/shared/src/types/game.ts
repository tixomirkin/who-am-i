export interface TPlayer {
  id: string;
  name: string;
  gameName: string;
  description: string;
  isAdmin: boolean;
  isSpectator: boolean;
  avatar: string | null;
}

export interface TGameState {
  players: TPlayer[];
  round: number;
  turnPlayerId: string | null;
}

export interface ImgurUploadResponse {
  link: string;
  id?: string;
  deletehash?: string;
  [key: string]: unknown;
}
