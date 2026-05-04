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
 * Both endpoints are public (no API key required) but routed through the
 * standard request pipeline so retries / timeouts / observability all work
 * the same way.
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
    const res = await performRequest<SupportedCountrySummary>(this.client, {
      method: "GET",
      path: `/v1/meta/countries/${encodeURIComponent(normalized)}`,
    });
    return { ...res.data, _requestId: res.requestId };
  }
}
