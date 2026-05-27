import { describe, expect, it } from "vitest";
import { mulberry32, rollDie, rollDice, expandDice, defaultRng } from "@/lib/engine/rng";

describe("mulberry32", () => {
  it("is deterministic for same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("returns values in [0, 1)", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("different seeds produce different sequences", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });
});

describe("rollDie/rollDice", () => {
  it("rollDie returns integer 1..6", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      const d = rollDie(rng);
      expect(Number.isInteger(d)).toBe(true);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
    }
  });

  it("rollDice returns tuple", () => {
    const [a, b] = rollDice(mulberry32(3));
    expect(a).toBeGreaterThanOrEqual(1);
    expect(b).toBeLessThanOrEqual(6);
  });

  it("defaultRng works", () => {
    const v = defaultRng()();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });
});

describe("expandDice", () => {
  it("non-double returns pair", () => {
    expect(expandDice(3, 5)).toEqual([3, 5]);
  });
  it("double returns 4x", () => {
    expect(expandDice(4, 4)).toEqual([4, 4, 4, 4]);
  });
});
