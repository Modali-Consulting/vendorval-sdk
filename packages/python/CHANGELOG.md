# vendorval-sdk (Python)

## 0.2.0 — Unreleased

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

## 0.1.0 — Unreleased

Initial public release.

- `Vendorval` (sync) and `AsyncVendorval` (async) clients with `api_key` / `base_url` / `timeout` / `max_retries` options.
- Resources: `entities`, `verifications` (incl. `create_and_wait`), `monitors`, `providers`, `usage`, `jobs`.
- Auto-retry on `429` and `5xx` honoring `retry-after` and `x-ratelimit-reset`.
- Auto-generated idempotency keys for retried POSTs to verification endpoints.
- Typed errors: `AuthenticationError`, `PermissionError`, `ValidationError`, `RateLimitError`, `NotFoundError`, `ConflictError`, `ProviderError`, `APIError`.
- `request_id` exposed on every response and error.
- Forward-compatible `webhooks.construct_event` (placeholder until outbound delivery ships).
