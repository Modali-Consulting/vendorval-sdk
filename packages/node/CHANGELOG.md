# vendorval-sdk (Node)

## 0.2.0 — 2026-05-05

**Breaking:** Renamed npm package from `vendorval` to `vendorval-sdk`. Update consumers:

```diff
- npm install vendorval
+ npm install vendorval-sdk
```

```diff
- import Vendorval from "vendorval";
+ import Vendorval from "vendorval-sdk";
```

The default export, named exports, and runtime behaviour are unchanged.

**New — country-aware SDK surface (Phase J):**

- `IdentifierType` extended with `vat_id`; `CheckType` extended with `vat_validation`, `lei_validation`, `sanctions_screening`.
- New `CountryCode`, `EntityRegion`, `CountryTier` types and a typed `SupportedCountrySummary` / `SupportedCountriesResponse` pair mirroring `/v1/meta/countries`.
- New `MetaResource` exposing `client.meta.listSupportedCountries()` and `client.meta.getSupportedCountry(code)`.
- `entities.lookup` / `verifications.create` accept an optional `country` parameter that is forwarded to the API.
- New `CountryError` (subclass of `ValidationError`) wired into the response-to-error mapping for the five 422 codes: `country_required`, `country_not_supported`, `identifier_not_supported_for_country`, `check_not_supported_for_country`, `country_mismatch`. Plain 422 responses now map to `ValidationError` so non-country semantic violations inherit the same catch-all behaviour.

## 0.1.0 — Unreleased

Initial public release.

- `Vendorval` client with `apiKey` / `baseUrl` / `timeout` / `maxRetries` / `fetch` options.
- Resources: `entities`, `verifications` (incl. `createAndWait`), `monitors`, `providers`, `usage`, `jobs`.
- Auto-retry on `429` and `5xx` honoring `retry-after` and `x-ratelimit-reset`.
- Auto-generated idempotency keys for retried POSTs to verification endpoints.
- Typed errors mirroring the API envelope: `AuthenticationError`, `PermissionError`, `ValidationError`, `RateLimitError`, `NotFoundError`, `ConflictError`, `ProviderError`, `APIError`.
- `x-request-id` exposed on responses and errors.
- Forward-compatible `webhooks.constructEvent` (placeholder until outbound delivery ships).
- AsyncIterator-based pagination so list endpoints stay source-compatible when cursors are introduced.
