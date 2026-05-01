"""Webhook signature verification tests."""

from __future__ import annotations

import hashlib
import hmac
import json
import time

import pytest

from vendorval_sdk import VendorvalError, construct_event


def sign(payload: str, secret: str, ts: int) -> str:
    v1 = hmac.new(secret.encode(), f"{ts}.{payload}".encode(), hashlib.sha256).hexdigest()
    return f"t={ts},v1={v1}"


SECRET = "whsec_test"


def test_valid_signature_returns_parsed_event() -> None:
    payload = json.dumps({"id": "evt_1", "type": "verification.completed"})
    ts = int(time.time())
    header = sign(payload, SECRET, ts)
    event = construct_event(payload, header, SECRET)
    assert event == {"id": "evt_1", "type": "verification.completed"}


def test_wrong_signature_raises() -> None:
    payload = json.dumps({"id": "evt_1"})
    ts = int(time.time())
    header = sign(payload, "wrong", ts)
    with pytest.raises(VendorvalError):
        construct_event(payload, header, SECRET)


def test_expired_timestamp_raises() -> None:
    payload = json.dumps({"id": "evt_1"})
    ts = int(time.time()) - 600
    header = sign(payload, SECRET, ts)
    with pytest.raises(VendorvalError, match="tolerance"):
        construct_event(payload, header, SECRET, tolerance=60)


def test_malformed_header_raises() -> None:
    with pytest.raises(VendorvalError, match="malformed"):
        construct_event("{}", "garbage", SECRET)
