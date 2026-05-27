import type { WinType } from "@/lib/supabase/types";

const K = 32;

const WIN_TYPE_MULTIPLIER: Record<WinType, number> = {
  normal: 1,
  mars: 1.5,
  koks: 2,
};

export function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export function eloDelta(
  winnerElo: number,
  loserElo: number,
  winType: WinType,
): { winnerDelta: number; loserDelta: number } {
  const exp = expectedScore(winnerElo, loserElo);
  const mult = WIN_TYPE_MULTIPLIER[winType];
  const delta = Math.round(K * mult * (1 - exp));
  return { winnerDelta: delta, loserDelta: -delta };
}
