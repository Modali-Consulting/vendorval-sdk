import { describe, expect, it, vi } from "vitest";

import { Vendorval } from "../src/index.js";
import { VendorvalError } from "../src/index.js";

describe("Vendorval client construction", () => {
  it("requires an API key", () => {
    delete process.env.VENDORVAL_API_KEY;
    expect(() => new Vendorval({})).toThrowError(VendorvalError);
  });

  it("rejects an API key without the vv_ prefix", () => {
    expect(() => new Vendorval({ apiKey: "sk_live_abcdef" })).toThrowError(/prefix/);
  });

  it("accepts a vv_test_ prefix", () => {
    const c = new Vendorval({ apiKey: "vv_test_abc123" });
    expect(c.options.apiKey).toBe("vv_test_abc123");
  });

  it("accepts a vv_live_ prefix", () => {
    const c = new Vendorval({ apiKey: "vv_live_xyz789" });
    expect(c.options.apiKey).toBe("vv_live_xyz789");
  });

  it("can be opted out of prefix validation", () => {
    const c = new Vendorval({ apiKey: "custom_internal_key", validateApiKey: false });
    expect(c.options.apiKey).toBe("custom_internal_key");
  });

  it("falls back to env vars", () => {
    process.env.VENDORVAL_API_KEY = "vv_test_fromenv";
    process.env.VENDORVAL_BASE_URL = "https://staging.example/";
    const c = new Vendorval({});
    expect(c.options.apiKey).toBe("vv_test_fromenv");
    expect(c.options.baseUrl).toBe("https://staging.example");
    delete process.env.VENDORVAL_API_KEY;
    delete process.env.VENDORVAL_BASE_URL;
  });

  it("calls the API with the bearer token, version header, and json body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ match: "not_found", entity: null }), {
        status: 200,
        headers: { "content-type": "application/json", "x-request-id": "req_test_1" },
      }),
    );
    const client = new Vendorval({
      apiKey: "vv_test_abc",
      baseUrl: "https://api.example",
      fetch: fetchMock,
    });

    const r = await client.entities.lookup({ identifiers: { uei: "X" } });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.example/v1/entities/lookup");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer vv_test_abc");
    expect(headers["X-VendorVal-API-Version"]).toBe(Vendorval.API_VERSION);
    expect(headers["User-Agent"]).toMatch(/^vendorval-node\//);
    expect(headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual({ identifiers: { uei: "X" } });
    expect(r.match).toBe("not_found");
    expect(r._requestId).toBe("req_test_1");
  });

});
