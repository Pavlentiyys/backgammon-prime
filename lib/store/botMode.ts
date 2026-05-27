"use client";
import { useEffect } from "react";
import { useGameStore } from "./gameStore";
import { pickBestMove, BotLevel } from "@/lib/engine/bot/expectimax";
import { applyHalfMove } from "@/lib/engine/rules";
import { endTurn, setDice } from "@/lib/engine/game";
import { rollDice, defaultRng } from "@/lib/engine/rng";
import { isGameOver } from "@/lib/engine/terminal";
import { Color } from "@/lib/engine/types";

const TURN_DELAY_MS = 450;

export function useBotAutoplay(botColor: Color, level: BotLevel) {
  const state = useGameStore((s) => s.state);
  const gameOver = useGameStore((s) => s.gameOver);

  useEffect(() => {
    if (gameOver.over) return;
    if (state.turn !== botColor) return;

    const timer = setTimeout(() => {
      const cur = useGameStore.getState().state;
      if (cur.turn !== botColor) return;

      let working = cur;
      if (working.remaining.length === 0) {
        const [d1, d2] = rollDice(defaultRng());
        working = setDice(working, d1, d2);
      }

      const seq = pickBestMove(working, level);
      for (const m of seq) working = applyHalfMove(working, m);

      const terminal = isGameOver(working);
      if (terminal.over) {
        useGameStore.setState({ state: working, gameOver: terminal });
        return;
      }
      const next = endTurn(working);
      useGameStore.setState({
        state: next,
        history: [],
        sequenceSoFar: [],
        selected: null,
      });
    }, TURN_DELAY_MS);

    return () => clearTimeout(timer);
  }, [state, botColor, level, gameOver.over]);
}
