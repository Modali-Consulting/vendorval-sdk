import { randomUUID } from "node:crypto";

/** Generate an idempotency key suitable for `options.idempotency_key`. */
export function generateIdempotencyKey(): string {
  return randomUUID();
}
