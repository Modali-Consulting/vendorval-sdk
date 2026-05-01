"""Retry and idempotency injection tests."""

from __future__ import annotations

import contextlib
import json

import httpx
import respx

from vendorval import Vendorval


@respx.mock
def test_retries_5xx_then_succeeds() -> None:
    route = respx.post("https://api.example/v1/entities/lookup").mock(
        side_effect=[
            httpx.Response(503, json={"error": {"type": "x", "code": "x", "message": "x"}}),
            httpx.Response(200, json={"match": "not_found", "entity": None}),
        ]
    )
    with Vendorval(api_key="vv_test_x", base_url="https://api.example", max_retries=1) as client:
        result = client.entities.lookup(identifiers={"uei": "X"})
    assert result.match == "not_found"
    assert route.call_count == 2


@respx.mock
def test_does_not_retry_4xx() -> None:
    route = respx.post("https://api.example/v1/entities/lookup").mock(
        return_value=httpx.Response(400, json={"error": {"type": "x", "code": "x", "message": "bad"}}),
    )
    with (
        Vendorval(api_key="vv_test_x", base_url="https://api.example", max_retries=3) as client,
        contextlib.suppress(Exception),
    ):
        client.entities.lookup(identifiers={})
    assert route.call_count == 1


@respx.mock
def test_auto_idempotency_on_retried_verify() -> None:
    route = respx.post("https://api.example/v1/verify").mock(
        side_effect=[
            httpx.Response(429, headers={"retry-after": "0"}, json={"error": {"type": "rate_limit_error", "code": "x", "message": "x"}}),
            httpx.Response(200, json={
                "object": "verification_bundle",
                "entity": {"id": "ent_x"},
                "verification": {"id": "ver_x", "status": "completed"},
            }),
        ]
    )
    with Vendorval(api_key="vv_test_x", base_url="https://api.example", max_retries=1) as client:
        client.verifications.create(
            identifiers=[{"type": "uei", "value": "X"}],
            checks=["sam_registration"],
        )

    assert route.call_count == 2
    first_body = json.loads(route.calls[0].request.content)
    second_body = json.loads(route.calls[1].request.content)
    assert "options" not in first_body or "idempotency_key" not in first_body.get("options", {})
    assert "idempotency_key" in second_body["options"]
    assert len(second_body["options"]["idempotency_key"]) >= 16
