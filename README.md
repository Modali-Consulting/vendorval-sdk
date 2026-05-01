# VendorVal SDKs

Official client libraries for the [VendorVal API](https://docs.vendorval.com).

| Language | Package | Source |
|----------|---------|--------|
| Node / TypeScript | [`vendorval`](https://www.npmjs.com/package/vendorval) on npm | [`packages/node`](./packages/node) |
| Python | [`vendorval`](https://pypi.org/project/vendorval/) on PyPI | [`packages/python`](./packages/python) |

Both SDKs target the VendorVal REST API (`https://api.vendorval.com/v1`) and ship the same surface: entity lookup, verification (with polling helper), monitoring, providers, usage, and jobs.

## Quick start

### Node / TypeScript

```bash
npm install vendorval
```

```ts
import Vendorval from "vendorval";

const client = new Vendorval({ apiKey: process.env.VENDORVAL_API_KEY });

const result = await client.entities.lookup({
  identifiers: { uei: "ABCD12345678" },
});
```

### Python

```bash
pip install vendorval
```

```python
from vendorval import Vendorval

client = Vendorval()  # reads VENDORVAL_API_KEY from env

result = client.entities.lookup(identifiers={"uei": "ABCD12345678"})
```

## Repository layout

```text
vendorval-sdk/
  packages/
    node/        # TypeScript SDK (publishes to npm as `vendorval`)
    python/      # Python SDK (publishes to PyPI as `vendorval`)
  specs/
    openapi.json # Snapshot of the API's OpenAPI spec, mirrored from vendorval-api
  examples/      # Per-language runnable examples
  scripts/       # Spec sync helpers
```

## Development

```bash
pnpm install
pnpm -r build              # build all Node packages
pnpm -r test               # run all Node tests

cd packages/python
uv sync
uv run pytest
```

See [`RELEASING.md`](./RELEASING.md) for how to cut new releases.

## Issue tracking

Report bugs and feature requests via [GitHub issues](https://github.com/Modali-Consulting/vendorval-sdk/issues). Issues should be added to the [VendorVal project](https://github.com/orgs/Modali-Consulting/projects/3).

## License

[MIT](./LICENSE)
