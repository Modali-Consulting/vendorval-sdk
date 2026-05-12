"""Certifications resource (sync + async). Phase N customer-facing
reshape, Workstream B.

Today this surface is read-only — `list` + `retrieve`. POST + DELETE
(manual upload + revoke) land in a follow-up SDK release once those
API routes ship.
"""

from __future__ import annotations

from typing import Any
from urllib.parse import quote

import httpx

from .._models import Response
from .._request import ResolvedConfig, execute_async, execute_sync, prepare


def _build_query(
    *,
    entity_id: str | None,
    issuer: str | None,
    status: str | None,
    expiring_within_days: int | None,
    limit: int | None,
    offset: int | None,
) -> dict[str, Any]:
    return {
        "entity_id": entity_id,
        "issuer": issuer,
        "status": status,
        "expiring_within_days": expiring_within_days,
        "limit": limit,
        "offset": offset,
    }


class CertificationsResource:
    def __init__(self, cfg: ResolvedConfig, client: httpx.Client) -> None:
        self._cfg = cfg
        self._client = client

    def list(
        self,
        *,
        entity_id: str | None = None,
        issuer: str | None = None,
        status: str | None = None,
        expiring_within_days: int | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> Response:
        """List certifications for the calling org.

        Returns the full list envelope verbatim so callers see pagination
        metadata (`total`, `has_more`, `limit`, `offset`) without
        re-querying for the count. Access rows via `response["data"]`,
        or call `response.to_dict()` to work with the full payload as a
        plain dictionary.
        """
        prepared = prepare(
            self._cfg,
            method="GET",
            path="/v1/certifications",
            query=_build_query(
                entity_id=entity_id,
                issuer=issuer,
                status=status,
                expiring_within_days=expiring_within_days,
                limit=limit,
                offset=offset,
            ),
        )
        res = execute_sync(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    def retrieve(self, certification_id: str) -> Response:
        """Fetch a single certification by its public id (`cert_…`)."""
        prepared = prepare(
            self._cfg,
            method="GET",
            path=f"/v1/certifications/{quote(certification_id, safe='')}",
        )
        res = execute_sync(self._client, prepared)
        return Response(res.data, res.request_id, res.status)


class AsyncCertificationsResource:
    def __init__(self, cfg: ResolvedConfig, client: httpx.AsyncClient) -> None:
        self._cfg = cfg
        self._client = client

    async def list(
        self,
        *,
        entity_id: str | None = None,
        issuer: str | None = None,
        status: str | None = None,
        expiring_within_days: int | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> Response:
        prepared = prepare(
            self._cfg,
            method="GET",
            path="/v1/certifications",
            query=_build_query(
                entity_id=entity_id,
                issuer=issuer,
                status=status,
                expiring_within_days=expiring_within_days,
                limit=limit,
                offset=offset,
            ),
        )
        res = await execute_async(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    async def retrieve(self, certification_id: str) -> Response:
        prepared = prepare(
            self._cfg,
            method="GET",
            path=f"/v1/certifications/{quote(certification_id, safe='')}",
        )
        res = await execute_async(self._client, prepared)
        return Response(res.data, res.request_id, res.status)
