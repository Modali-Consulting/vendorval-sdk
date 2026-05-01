# live-smoke (Node)

End-to-end smoke test that links the local Node SDK build (`../../../packages/node`) via the pnpm workspace and hits the real VendorVal API. Useful for verifying a pre-release before publishing to npm.

## Run

```bash
cp .env.example .env
# edit .env: set VENDORVAL_API_KEY and VENDORVAL_UEI
pnpm install               # from the repo root, links `vendorval` workspace:*
pnpm --filter vendorval build
pnpm --filter vendorval-example-live-smoke start
```

Calls `client.entities.lookup({ identifiers: { uei } })` against `https://api.vendorval.com/v1` by default and prints the JSON entity record.

Override the target with `VENDORVAL_BASE_URL` (host only, e.g. `https://api.vendorval.com`) in `.env` to hit staging or a local server.

Requires Node 20.6+ for `node --env-file=.env`. On older Node, replace the `start` script with `node -r dotenv/config index.mjs` and add `dotenv` as a dep.
