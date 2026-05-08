# Changelog

This file is an aggregate index. Per-package changelogs live alongside each package:

- [`packages/node/CHANGELOG.md`](./packages/node/CHANGELOG.md)
- [`packages/python/CHANGELOG.md`](./packages/python/CHANGELOG.md)

## 2026-05-08

- **Tier A entity fields + tightened `LookupResponse.match` union** (#5). The Node `Entity` interface (`packages/node/src/types/shared.ts`) and the Python `Entity` TypedDict (`packages/python/src/vendorval_sdk/types.py`) gain `dba_name`, `website_url`, and `state_of_incorporation` (all `string | None`). Node `LookupResponse.match` tightened from `"found" | "not_found" | "ambiguous" | "fuzzy"` to the actual API contract `"exact" | "fuzzy" | "not_found"`; `confidence` documented as fuzzy-only.
- Both packages stay at 0.2.x — types-only change, additive.

## 2026-05-05

- First public release on npm and PyPI as `vendorval-sdk` (Node v0.2.0, Python v0.2.0).
- Includes the package rename from `vendorval` and the Phase J country-aware surface (`vat_id`, `vat_validation`, `lei_validation`, `sanctions_screening`, `meta.listSupportedCountries`, `CountryError`).
