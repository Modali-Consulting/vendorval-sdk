# vendorval-test (python)

Live smoke test for the local Python SDK build (`../packages/python`).

```bash
cp .env.example .env
# edit .env: set VENDORVAL_API_KEY and VENDORVAL_UEI
uv sync
uv run main.py
```

Calls `client.entities.lookup(identifiers={"uei": uei})` against the production API (`https://api.vendorval.com/v1` by default) and prints the JSON entity record.

Override the target by setting `VENDORVAL_BASE_URL` in `.env`.
