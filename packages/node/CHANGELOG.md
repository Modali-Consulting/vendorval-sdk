# vendorval (Node)

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
