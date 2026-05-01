"""Async client smoke tests."""

from __future__ import annotations

import httpx
import pytest
import respx

from vendorval_sdk import AsyncVendorval


@pytest.mark.asyncio
@respx.mock
async def test_async_lookup() -> None:
    respx.post("https://api.example/v1/entities/lookup").mock(
        return_value=httpx.Response(
            200,
            json={"match": "found", "entity": {"id": "ent_x"}},
            headers={"x-request-id": "req_async_1"},
        )
    )
    async with AsyncVendorval(api_key="vv_test_x", base_url="https://api.example") as client:
        result = await client.entities.lookup(identifiers={"uei": "X"})
    assert result.match == "found"
    assert result.request_id == "req_async_1"
