# Releasing

Each SDK has its own version timeline. Tag prefixes determine which package gets released.

## Node (`packages/node` → npm `vendorval`)

1. Update `packages/node/package.json` `version` and `packages/node/CHANGELOG.md`.
2. Commit on `main`: `git commit -am "release(node): v0.X.Y"`.
3. Tag: `git tag node-v0.X.Y && git push --tags`.
4. The `release-node.yml` workflow runs `pnpm publish --access public --provenance` using OIDC.

## Python (`packages/python` → PyPI `vendorval`)

1. Update `packages/python/pyproject.toml` `version` and `packages/python/CHANGELOG.md`.
2. Commit on `main`: `git commit -am "release(python): v0.X.Y"`.
3. Tag: `git tag python-v0.X.Y && git push --tags`.
4. The `release-python.yml` workflow builds with `hatchling` and uploads via PyPI Trusted Publishing (OIDC, no API tokens).

### One-time PyPI Trusted Publishing setup

Configure a Trusted Publisher under [PyPI Project Settings → Publishing](https://pypi.org/manage/project/vendorval/settings/publishing/):

- Owner: `Modali-Consulting`
- Repository: `vendorval-sdk`
- Workflow: `release-python.yml`
- Environment: `pypi`

## Pre-release smoke (recommended)

Before a `0.1.0` GA tag, cut a release candidate to validate the publish pipeline:

```bash
# Node
git tag node-v0.1.0-rc.0
# Python
git tag python-v0.1.0-rc.0
```

The release workflows publish RCs as `vendorval@0.1.0-rc.0` (`--tag next` on npm) and `vendorval==0.1.0rc0` on PyPI.

## API version pinning

Both SDKs send the header `X-VendorVal-API-Version: <ISO date>`. When the API ships a breaking version, SDK majors bump the header value.

## Spec drift

The `spec-drift.yml` workflow runs nightly: it pulls the latest `openapi.json` from the most recent `vendorval-api` GitHub release and opens a PR if the snapshot in `specs/openapi.json` has changed.
