import { describe, expect, it } from "vitest";
import { hasIllegalSixPrime } from "@/lib/engine/rules";
import { emptyPoints } from "@/lib/engine/state";
import { pathPos } from "@/lib/engine/board";
import { Point } from "@/lib/engine/types";

function place(points: Point[], abs: number, color: "white" | "black", count = 1) {
  points[abs] = { color, count };
}

describe("hasIllegalSixPrime", () => {
  it("returns false when no 6-in-a-row exists", () => {
    const pts = emptyPoints();
    place(pts, 23, "white", 5);
    place(pts, 22, "white", 1);
    place(pts, 11, "black", 15);
    expect(hasIllegalSixPrime(pts, "white")).toBe(false);
  });

  it("returns true when white builds 6-prime trapping all black behind it", () => {
    const pts = emptyPoints();
    // build white 6-prime at abs 18..23
    for (let i = 18; i <= 23; i++) place(pts, i, "white", 2);
    // all black still on their head (abs 11): pathPos=0, much less than prime
    place(pts, 11, "black", 15);
    // in black's coordinates, prime cells have higher pathPos than 0 → black hasn't passed → illegal
    const blackPathOfPrime = [18, 19, 20, 21, 22, 23].map((i) => pathPos(i, "black"));
    const maxOppPath = Math.max(...blackPathOfPrime);
    expect(pathPos(11, "black")).toBeLessThan(maxOppPath);
    expect(hasIllegalSixPrime(pts, "white")).toBe(true);
  });

  it("returns false when at least one opponent checker has passed the prime", () => {
    const pts = emptyPoints();
    for (let i = 18; i <= 23; i++) place(pts, i, "white", 2);
    // place one black checker that has already passed prime in black's path
    // black home is abs 12..17 (pathPos 18..23). a black checker at abs 14 has pathPos beyond prime cells in black coords? Let's compute
    const blackPathOfPrime = Math.max(...[18, 19, 20, 21, 22, 23].map((i) => pathPos(i, "black")));
    // find an abs idx where black's pathPos > blackPathOfPrime
    let placed = false;
    for (let i = 0; i < 24; i++) {
      if (pathPos(i, "black") > blackPathOfPrime) {
        place(pts, i, "black", 15);
        placed = true;
        break;
      }
    }
    expect(placed).toBe(true);
    expect(hasIllegalSixPrime(pts, "white")).toBe(false);
  });

  it("ignores 7+ in a row (handled as 'not bounded' if extended)", () => {
    const pts = emptyPoints();
    // 7-in-a-row at abs 17..23 — every inner 6-cell window has owned neighbors on both sides,
    // so the function skips all of them
    for (let i = 17; i <= 23; i++) place(pts, i, "white", 2);
    place(pts, 11, "black", 15);
    expect(hasIllegalSixPrime(pts, "white")).toBe(false);
  });
});
