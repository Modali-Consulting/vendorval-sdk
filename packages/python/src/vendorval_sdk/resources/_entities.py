"""Entity resource (sync + async)."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from urllib.parse import quote

import httpx

from .._models import Response
from .._request import ResolvedConfig, execute_async, execute_sync, prepare


class EntitiesResource:
    def __init__(self, cfg: ResolvedConfig, client: httpx.Client) -> None:
        self._cfg = cfg
        self._client = client

    def lookup(
        self,
        *,
        identifiers: Mapping[str, str],
        legal_name: str | None = None,
        mode: str | None = None,
        country: str | None = None,
        options: Mapping[str, Any] | None = None,
    ) -> Response:
        body: dict[str, Any] = {"identifiers": dict(identifiers)}
        if legal_name is not None:
            body["legal_name"] = legal_name
        if mode is not None:
            body["mode"] = mode
        if country is not None:
            body["country"] = country
        if options is not None:
            body["options"] = dict(options)
        prepared = prepare(self._cfg, method="POST", path="/v1/entities/lookup", body=body)
        res = execute_sync(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    def create(
        self,
        *,
        identifiers: list[dict[str, str]],
        legal_name: str,
        entity_type: str,
        country: str | None = None,
        address: Mapping[str, Any] | None = None,
    ) -> Response:
        body: dict[str, Any] = {
            "identifiers": list(identifiers),
            "legal_name": legal_name,
            "entity_type": entity_type,
        }
        if country is not None:
            body["country"] = country
        if address is not None:
            body["address"] = dict(address)
        prepared = prepare(
            self._cfg,
            method="POST",
            path="/v1/entities",
            body=body,
            auto_idempotency=True,
        )
        res = execute_sync(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    def retrieve(self, entity_id: str) -> Response:
        prepared = prepare(self._cfg, method="GET", path=f"/v1/entities/{quote(entity_id, safe='')}")
        res = execute_sync(self._client, prepared)
        return Response(res.data, res.request_id, res.status)


class AsyncEntitiesResource:
    def __init__(self, cfg: ResolvedConfig, client: httpx.AsyncClient) -> None:
        self._cfg = cfg
        self._client = client

    async def lookup(
        self,
        *,
        identifiers: Mapping[str, str],
        legal_name: str | None = None,
        mode: str | None = None,
        country: str | None = None,
        options: Mapping[str, Any] | None = None,
    ) -> Response:
        body: dict[str, Any] = {"identifiers": dict(identifiers)}
        if legal_name is not None:
            body["legal_name"] = legal_name
        if mode is not None:
            body["mode"] = mode
        if country is not None:
            body["country"] = country
        if options is not None:
            body["options"] = dict(options)
        prepared = prepare(self._cfg, method="POST", path="/v1/entities/lookup", body=body)
        res = await execute_async(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    async def create(
        self,
        *,
        identifiers: list[dict[str, str]],
        legal_name: str,
        entity_type: str,
        country: str | None = None,
        address: Mapping[str, Any] | None = None,
    ) -> Response:
        body: dict[str, Any] = {
            "identifiers": list(identifiers),
            "legal_name": legal_name,
            "entity_type": entity_type,
        }
        if country is not None:
            body["country"] = country
        if address is not None:
            body["address"] = dict(address)
        prepared = prepare(
            self._cfg,
            method="POST",
            path="/v1/entities",
            body=body,
            auto_idempotency=True,
        )
        res = await execute_async(self._client, prepared)
        return Response(res.data, res.request_id, res.status)

    async def retrieve(self, entity_id: str) -> Response:
        prepared = prepare(self._cfg, method="GET", path=f"/v1/entities/{quote(entity_id, safe='')}")
        res = await execute_async(self._client, prepared)
        return Response(res.data, res.request_id, res.status)
