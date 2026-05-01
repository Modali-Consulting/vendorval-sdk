import { createHmac, timingSafeEqual } from "node:crypto";

import { VendorvalError } from "./errors.js";

/**
 * Verify and parse a VendorVal webhook payload.
 *
 * NOTE: outbound webhook delivery is not enabled in the API yet. This helper
 * exists so handler code is ready when delivery ships. The signature scheme
 * mirrors the leading SaaS convention (`t=…,v1=…`); when the API ships
 * delivery it MUST adopt the same header format.
 *
 * @param payload   Raw request body, exactly as received (do NOT re-stringify).
 * @param signature Value of the `vendorval-signature` header.
 * @param secret    Endpoint signing secret from the dashboard.
 * @param tolerance Max age of the timestamp, in seconds. Default 5 minutes.
 */
export function constructEvent(
  payload: string | Buffer,
  signature: string,
  secret: string,
  tolerance = 300,
): unknown {
  const raw = typeof payload === "string" ? payload : payload.toString("utf8");
  const parsed = parseSignatureHeader(signature);

  if (!parsed.timestamp || parsed.signatures.length === 0) {
    throw new VendorvalError({
      message: "Webhook signature header is malformed.",
      status: 0,
      type: "webhook_error",
      code: "invalid_signature_header",
      requestId: null,
    });
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - parsed.timestamp);
  if (ageSeconds > tolerance) {
    throw new VendorvalError({
      message: `Webhook timestamp is outside the tolerance zone (${ageSeconds.toFixed(0)}s).`,
      status: 0,
      type: "webhook_error",
      code: "timestamp_out_of_range",
      requestId: null,
    });
  }

  const expected = sign(`${parsed.timestamp}.${raw}`, secret);
  const ok = parsed.signatures.some((candidate) => safeEqual(candidate, expected));
  if (!ok) {
    throw new VendorvalError({
      message: "Webhook signature does not match expected value.",
      status: 0,
      type: "webhook_error",
      code: "signature_mismatch",
      requestId: null,
    });
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new VendorvalError({
      message: "Webhook payload is not valid JSON.",
      status: 0,
      type: "webhook_error",
      code: "invalid_payload",
      requestId: null,
    });
  }
}

function parseSignatureHeader(header: string): {
  timestamp: number | null;
  signatures: string[];
} {
  const parts = header.split(",").map((p) => p.trim());
  let timestamp: number | null = null;
  const signatures: string[] = [];
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (!k || !v) continue;
    if (k === "t") {
      const n = Number.parseInt(v, 10);
      if (Number.isFinite(n)) timestamp = n;
    } else if (k === "v1") {
      signatures.push(v);
    }
  }
  return { timestamp, signatures };
}

function sign(message: string, secret: string): string {
  return createHmac("sha256", secret).update(message, "utf8").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}
