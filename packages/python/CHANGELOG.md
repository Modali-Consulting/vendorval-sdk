# vendorval-sdk (Python)

## 0.2.0 — 2026-05-05

**Breaking:** Renamed PyPI distribution from `vendorval` to `vendorval-sdk` and import path from `vendorval` to `vendorval_sdk` to avoid collisions with the `vendorval` Frappe app and other downstream packages that want to claim the `vendorval` namespace. Update consumers:

```diff
- pip install vendorval
+ pip install vendorval-sdk
```

```diff
- from vendorval import Vendorval
+ from vendorval_sdk import Vendorval
```

The public class names (`Vendorval`, `AsyncVendorval`, error types, `construct_event`, …) and their behaviour are unchanged.

**New — country-aware SDK surface (Phase J):**

- `IdentifierType` extended with `vat_id`; `CheckType` extended with `vat_validation`, `lei_validation`, `sanctions_screening`.
- New `CountryCode`, `EntityRegion`, `CountryTier` types and a typed `SupportedCountrySummary` / `SupportedCountriesResponse` pair mirroring `/v1/meta/countries`.
- New `MetaResource` exposing `client.meta.list_supported_countries()` and `client.meta.get_supported_country(code)` (sync + async).
- `entities.lookup` / `verifications.create` accept an optional `country` parameter that is forwarded to the API.
- New `CountryError` (subclass of `ValidationError`) wired into the response-to-error mapping for the five 422 codes: `country_required`, `country_not_supported`, `identifier_not_supported_for_country`, `check_not_supported_for_country`, `country_mismatch`. Plain 422 responses now map to `ValidationError` so non-country semantic violations inherit the same catch-all behaviour.

## 0.1.0 — Unreleased

Initial public release.

- `Vendorval` (sync) and `AsyncVendorval` (async) clients with `api_key` / `base_url` / `timeout` / `max_retries` options.
- Resources: `entities`, `verifications` (incl. `create_and_wait`), `monitors`, `providers`, `usage`, `jobs`.
- Auto-retry on `429` and `5xx` honoring `retry-after` and `x-ratelimit-reset`.
- Auto-generated idempotency keys for retried POSTs to verification endpoints.
- Typed errors: `AuthenticationError`, `PermissionError`, `ValidationError`, `RateLimitError`, `NotFoundError`, `ConflictError`, `ProviderError`, `APIError`.
- `request_id` exposed on every response and error.
- Forward-compatible `webhooks.construct_event` (placeholder until outbound delivery ships).
