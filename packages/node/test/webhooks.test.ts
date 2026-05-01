import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { constructEvent, VendorvalError } from "../src/index.js";

function sign(payload: string, secret: string, timestamp: number): string {
  const v1 = createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex");
  return `t=${timestamp},v1=${v1}`;
}

describe("webhooks.constructEvent", () => {
  const SECRET = "whsec_test";

  it("verifies a valid signature and returns parsed JSON", () => {
    const payload = JSON.stringify({ id: "evt_1", type: "verification.completed" });
    const ts = Math.floor(Date.now() / 1000);
    const header = sign(payload, SECRET, ts);

    const event = constructEvent(payload, header, SECRET);
    expect(event).toEqual({ id: "evt_1", type: "verification.completed" });
  });

  it("rejects a wrong signature", () => {
    const payload = JSON.stringify({ id: "evt_1" });
    const ts = Math.floor(Date.now() / 1000);
    const header = sign(payload, "wrong-secret", ts);
    expect(() => constructEvent(payload, header, SECRET)).toThrowError(VendorvalError);
  });

  it("rejects an expired timestamp", () => {
    const payload = JSON.stringify({ id: "evt_1" });
    const ts = Math.floor(Date.now() / 1000) - 600;
    const header = sign(payload, SECRET, ts);
    expect(() => constructEvent(payload, header, SECRET, 60)).toThrowError(/tolerance/);
  });

  it("rejects a malformed header", () => {
    expect(() => constructEvent("{}", "garbage", SECRET)).toThrowError(/malformed/);
  });
});
