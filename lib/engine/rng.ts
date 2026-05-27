export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function defaultRng(): Rng {
  return Math.random;
}

export function rollDie(rng: Rng): number {
  return 1 + Math.floor(rng() * 6);
}

export function rollDice(rng: Rng): [number, number] {
  return [rollDie(rng), rollDie(rng)];
}

export function expandDice(d1: number, d2: number): number[] {
  return d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
}
