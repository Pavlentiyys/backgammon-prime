import { describe, expect, it } from "vitest";
import { absFromPath, applyDie, pathPos } from "@/lib/engine/board";
import { HEAD_INDEX } from "@/lib/engine/types";

describe("path positions", () => {
  it("white head has pathPos 0", () => {
    expect(pathPos(HEAD_INDEX.white, "white")).toBe(0);
  });
  it("black head has pathPos 0", () => {
    expect(pathPos(HEAD_INDEX.black, "black")).toBe(0);
  });
  it("roundtrips", () => {
    for (let i = 0; i < 24; i++) {
      expect(absFromPath(pathPos(i, "white"), "white")).toBe(i);
      expect(absFromPath(pathPos(i, "black"), "black")).toBe(i);
    }
  });
});

describe("applyDie", () => {
  it("white moves down: from abs 23 with die 1 → abs 22", () => {
    const r = applyDie(23, "white", 1);
    expect(r).toEqual({ type: "point", absIdx: 22 });
  });
  it("black wraps from abs 0 with die 5 → abs 19", () => {
    expect(pathPos(0, "black")).toBe(11);
    const r = applyDie(0, "black", 5);
    expect(r).toEqual({ type: "point", absIdx: 19 });
  });
  it("white bears off from path 23 with die 1 (exact)", () => {
    const abs = absFromPath(23, "white");
    const r = applyDie(abs, "white", 1);
    expect(r.type).toBe("off");
  });
});
