import type { GameState, MoveSequence, Color } from "@/lib/engine/types";

export type GameType = "bot" | "realtime" | "async" | "hotseat";
export type GameStatus = "waiting" | "active" | "finished" | "abandoned";
export type WinType = "normal" | "mars" | "koks";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  elo: number;
  games_played: number;
  wins: number;
  is_pro: boolean;
  pro_expires_at: string | null;
  gender: "male" | "female" | "unspecified" | null;
  is_bot: boolean;
  created_at: string;
}

export interface GameRow {
  id: string;
  type: GameType;
  player_white: string | null;
  player_black: string | null;
  status: GameStatus;
  winner_color: Color | null;
  win_type: WinType | null;
  state: GameState;
  time_per_move: number | null;
  last_move_at: string | null;
  created_at: string;
  finished_at: string | null;
}

export interface MoveRow {
  id: number;
  game_id: string;
  move_number: number;
  player_color: Color;
  dice: number[];
  move: MoveSequence;
  state_after: GameState;
  created_at: string;
}

export interface RoomRow {
  id: string;
  slug: string;
  game_id: string;
  host_id: string;
  is_public: boolean;
  created_at: string;
  expires_at: string | null;
}
