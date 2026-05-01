"""Error mapping tests."""

from __future__ import annotations

import httpx
import pytest
import respx

from vendorval import (
    AuthenticationError,
    ConflictError,
    NotFoundError,
    PermissionError,
    RateLimitError,
    ValidationError,
    Vendorval,
    VendorvalError,
)


def make_client() -> Vendorval:
    return Vendorval(
        api_key="vv_test_x",
        base_url="https://api.example",
        max_retries=0,
    )


@respx.mock
def test_400_validation() -> None:
    respx.post("https://api.example/v1/entities/lookup").mock(
        return_value=httpx.Response(
            400,
            json={"error": {"type": "invalid_request_error", "code": "invalid_request", "message": "bad", "param": "identifiers"}},
        )
    )
    with make_client() as client, pytest.raises(ValidationError) as ei:
        client.entities.lookup(identifiers={})
    assert ei.value.param == "identifiers"


@respx.mock
def test_401_authentication() -> None:
    respx.post("https://api.example/v1/entities/lookup").mock(
        return_value=httpx.Response(
            401,
            json={"error": {"type": "authentication_error", "code": "invalid_api_key", "message": "no"}},
        )
    )
    with make_client() as client, pytest.raises(AuthenticationError):
        client.entities.lookup(identifiers={"uei": "X"})


@respx.mock
def test_403_permission() -> None:
    respx.post("https://api.example/v1/entities/lookup").mock(
        return_value=httpx.Response(
            403,
            json={"error": {"type": "permission_error", "code": "missing_scope", "message": "no"}},
        )
    )
    with make_client() as client, pytest.raises(PermissionError):
        client.entities.lookup(identifiers={"uei": "X"})


@respx.mock
def test_404_not_found() -> None:
    respx.get("https://api.example/v1/entities/ent_x").mock(
        return_value=httpx.Response(
            404,
            json={"error": {"type": "not_found_error", "code": "entity_not_found", "message": "missing"}},
        )
    )
    with make_client() as client, pytest.raises(NotFoundError):
        client.entities.retrieve("ent_x")


@respx.mock
def test_409_conflict_with_candidates() -> None:
    respx.post("https://api.example/v1/verify").mock(
        return_value=httpx.Response(
            409,
            json={
                "error": {
                    "type": "conflict_error",
                    "code": "resolution_ambiguous",
                    "message": "ambiguous",
                    "candidates": [{"entity": {"id": "ent_a"}, "score": 0.9}],
                }
            },
        )
    )
    with make_client() as client, pytest.raises(ConflictError) as ei:
        client.verifications.create(
            identifiers=[{"type": "uei", "value": "X"}],
            checks=["sam_registration"],
        )
    assert ei.value.candidates is not None
    assert len(ei.value.candidates) == 1


@respx.mock
def test_429_rate_limit_retry_after() -> None:
    respx.post("https://api.example/v1/entities/lookup").mock(
        return_value=httpx.Response(
            429,
            headers={"retry-after": "13"},
            json={"error": {"type": "rate_limit_error", "code": "rate_limit_exceeded", "message": "slow"}},
        )
    )
    with make_client() as client, pytest.raises(RateLimitError) as ei:
        client.entities.lookup(identifiers={"uei": "X"})
    assert ei.value.retry_after == 13.0


@respx.mock
def test_500_falls_through() -> None:
    respx.post("https://api.example/v1/entities/lookup").mock(
        return_value=httpx.Response(500, json={"error": {"type": "internal_error", "code": "boom", "message": "oops"}}),
    )
    with make_client() as client, pytest.raises(VendorvalError):
        client.entities.lookup(identifiers={"uei": "X"})
