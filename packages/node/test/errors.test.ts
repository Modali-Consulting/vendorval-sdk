import { describe, expect, it, vi } from "vitest";

import {
  APIError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
  PermissionError,
  RateLimitError,
  ValidationError,
  Vendorval,
} from "../src/index.js";

function mockFetchOnce(status: number, body: unknown, headers: Record<string, string> = {}) {
  return vi.fn().mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json", "x-request-id": "req_x", ...headers },
    }),
  );
}

function client(fetchMock: typeof globalThis.fetch) {
  return new Vendorval({
    apiKey: "vv_test_abc",
    baseUrl: "https://api.example",
    fetch: fetchMock,
    maxRetries: 0,
  });
}

describe("error mapping", () => {
  it("400 → ValidationError with param/details", async () => {
    const fetchMock = mockFetchOnce(400, {
      error: {
        type: "invalid_request_error",
        code: "invalid_request",
        message: "identifiers.uei: Required",
        param: "identifiers.uei",
        details: [{ code: "invalid_type", message: "Required", path: "identifiers.uei" }],
      },
    });
    await expect(client(fetchMock).entities.lookup({ identifiers: {} } as never)).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("401 → AuthenticationError", async () => {
    const fetchMock = mockFetchOnce(401, {
      error: { type: "authentication_error", code: "invalid_api_key", message: "bad key" },
    });
    await expect(client(fetchMock).entities.lookup({ identifiers: { uei: "X" } })).rejects.toBeInstanceOf(
      AuthenticationError,
    );
  });

  it("403 → PermissionError", async () => {
    const fetchMock = mockFetchOnce(403, {
      error: { type: "permission_error", code: "missing_scope", message: "nope" },
    });
    await expect(client(fetchMock).entities.lookup({ identifiers: { uei: "X" } })).rejects.toBeInstanceOf(
      PermissionError,
    );
  });

  it("404 → NotFoundError", async () => {
    const fetchMock = mockFetchOnce(404, {
      error: { type: "not_found_error", code: "entity_not_found", message: "missing" },
    });
    await expect(client(fetchMock).entities.retrieve("ent_x")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("409 → ConflictError exposes candidates", async () => {
    const fetchMock = mockFetchOnce(409, {
      error: {
        type: "conflict_error",
        code: "resolution_ambiguous",
        message: "ambiguous",
        candidates: [{ entity: { id: "ent_a" }, score: 0.9 }],
      },
    });
    let caught: ConflictError | undefined;
    try {
      await client(fetchMock).verifications.create({
        identifiers: [{ type: "uei", value: "X" }],
        checks: ["sam_registration"],
      });
    } catch (err) {
      caught = err as ConflictError;
    }
    expect(caught).toBeInstanceOf(ConflictError);
    expect(caught!.candidates).toHaveLength(1);
  });

  it("429 → RateLimitError exposes retryAfter", async () => {
    const fetchMock = mockFetchOnce(
      429,
      { error: { type: "rate_limit_error", code: "rate_limit_exceeded", message: "slow down" } },
      { "retry-after": "13" },
    );
    let caught: RateLimitError | undefined;
    try {
      await client(fetchMock).entities.lookup({ identifiers: { uei: "X" } });
    } catch (err) {
      caught = err as RateLimitError;
    }
    expect(caught).toBeInstanceOf(RateLimitError);
    expect(caught!.retryAfter).toBe(13);
    expect(caught!.requestId).toBe("req_x");
  });

  it("status 500 → APIError after retries exhausted", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { type: "internal_error", code: "boom", message: "oops" } }), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
    );
    await expect(client(fetchMock).entities.lookup({ identifiers: { uei: "X" } })).rejects.toBeInstanceOf(
      APIError,
    );
  });
});
