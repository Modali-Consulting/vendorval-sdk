import { performRequest, type ResolvedClientOptions } from "../request.js";
import type {
  CountryCode,
  SupportedCountriesResponse,
  SupportedCountrySummary,
} from "../types/shared.js";

/**
 * Meta endpoints — read-only discovery surface for what the API supports.
 *
 * `listSupportedCountries()` returns every country code, region, tier, and
 * the currently enabled identifiers + checks for it. Drives the dashboard's
 * country picker; SDK consumers should call this once per session and cache
 * the result (e.g. an in-memory map keyed by `code`).
 *
 * `getSupportedCountry(code)` is a focused single-country variant.
 *
 * The underlying HTTP endpoints are public on the server — no special
 * API-key permissions are required. The SDK still routes through the
 * standard request pipeline so retries / timeouts / observability work the
 * same way as authenticated calls, which means a key is required to
 * construct the client. For genuine unauthenticated bootstrap (e.g. a
 * marketing page that needs the country list before login), construct the
 * client with a placeholder key and `validateApiKey: false`, or call
 * `GET /v1/meta/countries` directly with `fetch`.
 */
export class MetaResource {
  constructor(private readonly client: ResolvedClientOptions) {}

  async listSupportedCountries(): Promise<
    SupportedCountriesResponse & { _requestId: string | null }
  > {
    const res = await performRequest<SupportedCountriesResponse>(this.client, {
      method: "GET",
      path: "/v1/meta/countries",
    });
    return { ...res.data, _requestId: res.requestId };
  }

  async getSupportedCountry(
    code: CountryCode | string,
  ): Promise<SupportedCountrySummary & { _requestId: string | null }> {
    const normalized = String(code).trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalized)) {
      throw new TypeError(
        `Invalid country code "${String(code)}". Expected ISO 3166-1 alpha-2 (e.g. "US", "DE").`,
      );
    }
    const res = await performRequest<SupportedCountrySummary>(this.client, {
      method: "GET",
      path: `/v1/meta/countries/${encodeURIComponent(normalized)}`,
    });
    return { ...res.data, _requestId: res.requestId };
  }
}
