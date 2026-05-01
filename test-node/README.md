# vendorval-test-node

Live smoke test for the local Node SDK build (`../packages/node`).

```bash
cp .env.example .env
# edit .env: set VENDORVAL_API_KEY and VENDORVAL_UEI
npm install
npm start
```

Calls `client.entities.lookup({ identifiers: { uei } })` against the production API (`https://api.vendorval.com/v1` by default) and prints the JSON entity record.

Override the target by setting `VENDORVAL_BASE_URL` in `.env`.
