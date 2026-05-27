import { describe, expect, it } from "vitest";
import { createInitialState } from "@/lib/engine/state";
import { setDice } from "@/lib/engine/game";
import { getLegalSequences, applySequence } from "@/lib/engine/moves";
import { HEAD_INDEX } from "@/lib/engine/types";

describe("head rule", () => {
  it("allows only 1 from head on non-double first move", () => {
    const s = setDice(createInitialState(), 6, 5);
    const seqs = getLegalSequences(s);
    expect(seqs.length).toBeGreaterThan(0);
    for (const seq of seqs) {
      const headMoves = seq.filter((m) => m.from === HEAD_INDEX.white).length;
      expect(headMoves).toBeLessThanOrEqual(1);
    }
  });

  it("allows 2 from head on opening 6-6", () => {
    const s = setDice(createInitialState(), 6, 6);
    const seqs = getLegalSequences(s);
    const max = Math.max(
      ...seqs.map((seq) => seq.filter((m) => m.from === HEAD_INDEX.white).length),
    );
    expect(max).toBe(2);
  });

  it("allows 2 from head on opening 4-4", () => {
    const s = setDice(createInitialState(), 4, 4);
    const seqs = getLegalSequences(s);
    const max = Math.max(
      ...seqs.map((seq) => seq.filter((m) => m.from === HEAD_INDEX.white).length),
    );
    expect(max).toBe(2);
  });

  it("limits head to 1 on opening 5-5 (not a special double)", () => {
    const s = setDice(createInitialState(), 5, 5);
    const seqs = getLegalSequences(s);
    for (const seq of seqs) {
      const headMoves = seq.filter((m) => m.from === HEAD_INDEX.white).length;
      expect(headMoves).toBeLessThanOrEqual(1);
    }
  });
});

describe("applySequence", () => {
  it("reduces remaining dice by sequence length", () => {
    const s = setDice(createInitialState(), 3, 1);
    const seqs = getLegalSequences(s);
    const longest = seqs.reduce((a, b) => (b.length > a.length ? b : a), [] as typeof seqs[0]);
    const after = applySequence(s, longest);
    expect(after.remaining.length).toBe(s.remaining.length - longest.length);
  });
});

describe("must use larger die when only one playable", () => {
  it("returns no degenerate empty sequences when something is playable", () => {
    const s = setDice(createInitialState(), 6, 5);
    const seqs = getLegalSequences(s);
    expect(seqs.some((seq) => seq.length > 0)).toBe(true);
  });
});
