import { describe, expect, it } from "vitest";
import { createInitialState, deserialize, serialize, checkersOnBoard } from "@/lib/engine/state";
import { HEAD_INDEX } from "@/lib/engine/types";
import { pipCount } from "@/lib/engine/terminal";

describe("initial state", () => {
  it("places 15 white on white head and 15 black on black head", () => {
    const s = createInitialState();
    expect(s.points[HEAD_INDEX.white]).toEqual({ color: "white", count: 15 });
    expect(s.points[HEAD_INDEX.black]).toEqual({ color: "black", count: 15 });
    expect(checkersOnBoard(s, "white")).toBe(15);
    expect(checkersOnBoard(s, "black")).toBe(15);
  });

  it("serializes and deserializes losslessly", () => {
    const s = createInitialState();
    const round = deserialize(serialize(s));
    expect(round).toEqual(s);
  });

  it("equal starting pip count for both colors", () => {
    const s = createInitialState();
    expect(pipCount(s, "white")).toBe(pipCount(s, "black"));
  });
});
