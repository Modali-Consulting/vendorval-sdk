"""Monitors resource (sync + async)."""

from __future__ import annotations

from typing import Any

import httpx

from .._models import Response
from .._pagination import Page
from .._request import ResolvedConfig, execute_async, execute_sync, prepare


class MonitorsResource:
    def __init__(self, cfg: ResolvedConfig, client: httpx.Client) -> None:
        self._cfg = cfg
        self._client = client

    def create(self, *, entity_id: str, checks: list[str], cadence: str) -> Response:
        body: dict[str, Any] = {"entity_id": entity_id, "checks": list(checks), "cadence": cadence}
        prepared = prepare(self._cfg, method="POST", path="/v1/monitors", body=body)
        res = execute_sync(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    def retrieve(self, monitor_id: str) -> Response:
        prepared = prepare(self._cfg, method="GET", path=f"/v1/monitors/{monitor_id}")
        res = execute_sync(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    def list(
        self, *, status: str | None = None, limit: int | None = None
    ) -> Page[Response]:
        prepared = prepare(
            self._cfg, method="GET", path="/v1/monitors", query={"status": status, "limit": limit},
        )
        res = execute_sync(self._client, prepared)
        items = res.data if isinstance(res.data, list) else (res.data or {}).get("data", [])
        return Page([Response(it, res.request_id, res.status) for it in items])

    def delete(self, monitor_id: str) -> None:
        prepared = prepare(self._cfg, method="DELETE", path=f"/v1/monitors/{monitor_id}")
        execute_sync(self._client, prepared)

    def events(self, monitor_id: str) -> Page[Response]:
        prepared = prepare(self._cfg, method="GET", path=f"/v1/monitors/{monitor_id}/events")
        res = execute_sync(self._client, prepared)
        items = res.data if isinstance(res.data, list) else (res.data or {}).get("data", [])
        return Page([Response(it, res.request_id, res.status) for it in items])


class AsyncMonitorsResource:
    def __init__(self, cfg: ResolvedConfig, client: httpx.AsyncClient) -> None:
        self._cfg = cfg
        self._client = client

    async def create(self, *, entity_id: str, checks: list[str], cadence: str) -> Response:
        body: dict[str, Any] = {"entity_id": entity_id, "checks": list(checks), "cadence": cadence}
        prepared = prepare(self._cfg, method="POST", path="/v1/monitors", body=body)
        res = await execute_async(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    async def retrieve(self, monitor_id: str) -> Response:
        prepared = prepare(self._cfg, method="GET", path=f"/v1/monitors/{monitor_id}")
        res = await execute_async(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    async def list(
        self, *, status: str | None = None, limit: int | None = None
    ) -> Page[Response]:
        prepared = prepare(
            self._cfg, method="GET", path="/v1/monitors", query={"status": status, "limit": limit},
        )
        res = await execute_async(self._client, prepared)
        items = res.data if isinstance(res.data, list) else (res.data or {}).get("data", [])
        return Page([Response(it, res.request_id, res.status) for it in items])

    async def delete(self, monitor_id: str) -> None:
        prepared = prepare(self._cfg, method="DELETE", path=f"/v1/monitors/{monitor_id}")
        await execute_async(self._client, prepared)

    async def events(self, monitor_id: str) -> Page[Response]:
        prepared = prepare(self._cfg, method="GET", path=f"/v1/monitors/{monitor_id}/events")
        res = await execute_async(self._client, prepared)
        items = res.data if isinstance(res.data, list) else (res.data or {}).get("data", [])
        return Page([Response(it, res.request_id, res.status) for it in items])
