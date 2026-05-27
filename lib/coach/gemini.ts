import "server-only";
import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import { moveNotation, stateNotation } from "./notation";
import { setDice } from "@/lib/engine/game";
import { applySequence } from "@/lib/engine/moves";
import type { Color, GameState } from "@/lib/engine/types";
import type { MoveReview } from "./equity";

const SYSTEM = `Ты — тренер по длинным нардам (СНГ/Турция/Кавказ).
Объясни ошибки игрока коротко, конкретно, на языке игрока.
Тебе дают: позицию, кости, сыгранный ход, лучший ход, equity loss (число).
Не выдумывай оценок — используй данные числа. Используй термины: голова, дом, прайм, бэк-чекер.
Каждый разбор: 1-2 коротких абзаца, максимум 3 предложения.
Формат ответа: для каждого хода строка вида "Ход #N: <комментарий>".
В самом конце — одна строка итога без префикса "Ход".`;

export type CoachComment = { moveNumber: number; text: string };

export async function explainTopMistakes(
  initialState: GameState,
  states: GameState[],
  reviews: MoveReview[],
  color: Color,
  language: "ru" | "en" | "tr" | "az" = "ru",
): Promise<{ summary: string; comments: CoachComment[] }> {
  const top = [...reviews]
    .filter((r) => r.severity === "mistake" || r.severity === "blunder")
    .sort((a, b) => b.loss - a.loss)
    .slice(0, 3);

  if (top.length === 0) {
    return {
      summary:
        language === "ru" ? "Чистая партия — серьёзных ошибок нет." : "Clean game — no serious mistakes.",
      comments: [],
    };
  }

  const userBlocks = top
    .map((r) => {
      const beforeMove = states[r.moveNumber - 1] ?? initialState;
      const withDice = setDice(beforeMove, r.dice[0], r.dice[1]);
      const playedAfter = applySequence(withDice, r.playedSeq);
      const bestAfter = applySequence(withDice, r.bestSeq);
      return `Ход #${r.moveNumber} (${r.color === "white" ? "белые" : "чёрные"}), кости ${r.dice.join("-")}:
Позиция до: ${stateNotation(beforeMove, color)}
Сыграно: ${moveNotation(r.playedSeq, color, beforeMove)} → ${stateNotation(playedAfter, color)}
Лучше: ${moveNotation(r.bestSeq, color, beforeMove)} → ${stateNotation(bestAfter, color)}
Equity loss: ${r.loss.toFixed(1)} (${r.severity})`;
    })
    .join("\n\n");

  const userMessage = `Язык ответа: ${language}.
Разбери эти 3 хода. На каждый — короткий комментарий "Ход #N: ...". В конце — одна строка итога.

${userBlocks}`;

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userMessage,
    config: { systemInstruction: SYSTEM },
  });

  const text = response.text ?? "";
  const comments: CoachComment[] = [];
  let summary = "";
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  let currentNum: number | null = null;
  let buf: string[] = [];
  for (const line of lines) {
    const m = line.match(/^[*#\s]*[ХхHh]од\s*#?(\d+)[:.\s-]+(.+)/);
    if (m) {
      if (currentNum !== null) {
        comments.push({ moveNumber: currentNum, text: buf.join(" ").trim() });
      }
      currentNum = Number(m[1]);
      buf = [m[2]];
    } else {
      buf.push(line);
    }
  }
  if (currentNum !== null) {
    comments.push({ moveNumber: currentNum, text: buf.join(" ").trim() });
  }
  const lastLine = lines[lines.length - 1] ?? "";
  if (!lastLine.match(/^[*#\s]*[ХхHh]од/)) summary = lastLine;

  return { summary: summary || text.slice(0, 200), comments };
}
