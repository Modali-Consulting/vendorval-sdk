import { describe, expect, it } from "vitest";

import { generateIdempotencyKey } from "../src/index.js";

describe("generateIdempotencyKey", () => {
  it("returns a unique-ish string", () => {
    const a = generateIdempotencyKey();
    const b = generateIdempotencyKey();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(16);
  });
});
