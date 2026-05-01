"""Construction and request-shape tests."""

from __future__ import annotations

import httpx
import pytest
import respx

from vendorval import Vendorval, VendorvalError


def test_requires_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("VENDORVAL_API_KEY", raising=False)
    with pytest.raises(VendorvalError):
        Vendorval()


def test_rejects_unknown_prefix() -> None:
    with pytest.raises(VendorvalError, match="prefix"):
        Vendorval(api_key="sk_live_abcdef")


def test_accepts_vv_test_prefix() -> None:
    client = Vendorval(api_key="vv_test_abc")
    assert client.api_key == "vv_test_abc"
    client.close()


def test_can_skip_validation() -> None:
    client = Vendorval(api_key="custom", validate_api_key=False)
    assert client.api_key == "custom"
    client.close()


def test_falls_back_to_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VENDORVAL_API_KEY", "vv_test_envkey")
    monkeypatch.setenv("VENDORVAL_BASE_URL", "https://staging.example/")
    client = Vendorval()
    try:
        assert client.api_key == "vv_test_envkey"
        assert client.base_url == "https://staging.example"
    finally:
        client.close()


@respx.mock
def test_lookup_sends_bearer_and_version_headers() -> None:
    route = respx.post("https://api.example/v1/entities/lookup").mock(
        return_value=httpx.Response(
            200,
            json={"match": "not_found", "entity": None},
            headers={"x-request-id": "req_abc"},
        )
    )
    with Vendorval(api_key="vv_test_x", base_url="https://api.example") as client:
        result = client.entities.lookup(identifiers={"uei": "X"})

    assert route.called
    request = route.calls.last.request
    assert request.headers["authorization"] == "Bearer vv_test_x"
    assert request.headers["x-vendorval-api-version"] == Vendorval.API_VERSION
    assert request.headers["user-agent"].startswith("vendorval-python/")
    assert result.match == "not_found"
    assert result.request_id == "req_abc"
