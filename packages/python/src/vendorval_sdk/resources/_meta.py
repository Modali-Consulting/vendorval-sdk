"""Meta resource — read-only discovery of supported countries and capabilities.

`list_supported_countries()` returns every country code, region, tier, and
the currently enabled identifiers + checks for it. Drives the dashboard's
country picker; SDK consumers should call this once per session and cache
the result locally.

`get_supported_country(code)` is a focused single-country variant.

The underlying HTTP endpoints are public on the server — no special API-key
permissions are required. The SDK still routes through the standard request
pipeline so retries / timeouts / observability work the same way as
authenticated calls, which means a key is required to construct the client.
For genuine unauthenticated bootstrap (e.g. a marketing page that needs the
country list before login), construct the client with a placeholder key and
``validate_api_key=False``, or call ``GET /v1/meta/countries`` directly with
``httpx``.
"""

from __future__ import annotations

import re
from urllib.parse import quote

import httpx

from .._models import Response
from .._request import ResolvedConfig, execute_async, execute_sync, prepare

_COUNTRY_CODE_RE = re.compile(r"^[A-Z]{2}$")


def _normalize_country_code(code: str) -> str:
    """Normalize and validate an ISO 3166-1 alpha-2 country code.

    Trims and uppercases the input, then enforces the alpha-2 shape so that
    empty / whitespace-only / non-ISO values raise ``ValueError`` up front
    rather than producing a malformed ``/v1/meta/countries/`` path that
    silently returns the list endpoint or a 404.
    """
    normalized = code.strip().upper()
    if not _COUNTRY_CODE_RE.match(normalized):
        raise ValueError(
            f"Invalid country code {code!r}. Expected ISO 3166-1 alpha-2 (e.g. 'US', 'DE').",
        )
    return normalized


class MetaResource:
    def __init__(self, cfg: ResolvedConfig, client: httpx.Client) -> None:
        self._cfg = cfg
        self._client = client

    def list_supported_countries(self) -> Response:
        prepared = prepare(self._cfg, method="GET", path="/v1/meta/countries")
        res = execute_sync(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    def get_supported_country(self, code: str) -> Response:
        normalized = _normalize_country_code(code)
        prepared = prepare(
            self._cfg,
            method="GET",
            path=f"/v1/meta/countries/{quote(normalized, safe='')}",
        )
        res = execute_sync(self._client, prepared)
        return Response(res.data, res.request_id, res.status)


class AsyncMetaResource:
    def __init__(self, cfg: ResolvedConfig, client: httpx.AsyncClient) -> None:
        self._cfg = cfg
        self._client = client

    async def list_supported_countries(self) -> Response:
        prepared = prepare(self._cfg, method="GET", path="/v1/meta/countries")
        res = await execute_async(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    async def get_supported_country(self, code: str) -> Response:
        normalized = _normalize_country_code(code)
        prepared = prepare(
            self._cfg,
            method="GET",
            path=f"/v1/meta/countries/{quote(normalized, safe='')}",
        )
        res = await execute_async(self._client, prepared)
        return Response(res.data, res.request_id, res.status)
