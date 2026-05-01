# vendorval (Python)

## 0.1.0 — Unreleased

Initial public release.

- `Vendorval` (sync) and `AsyncVendorval` (async) clients with `api_key` / `base_url` / `timeout` / `max_retries` options.
- Resources: `entities`, `verifications` (incl. `create_and_wait`), `monitors`, `providers`, `usage`, `jobs`.
- Auto-retry on `429` and `5xx` honoring `retry-after` and `x-ratelimit-reset`.
- Auto-generated idempotency keys for retried POSTs to verification endpoints.
- Typed errors: `AuthenticationError`, `PermissionError`, `ValidationError`, `RateLimitError`, `NotFoundError`, `ConflictError`, `ProviderError`, `APIError`.
- `request_id` exposed on every response and error.
- Forward-compatible `webhooks.construct_event` (placeholder until outbound delivery ships).
