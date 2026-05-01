"""Webhook signature verification.

NOTE: outbound webhook delivery is not enabled in the API yet. This helper
exists so handler code is ready when delivery ships. The signature scheme
mirrors the leading SaaS convention (`t=…,v1=…`); when delivery lands the
API MUST adopt the same header format.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import time
from typing import Any

from ._errors import VendorvalError


def construct_event(
    payload: str | bytes,
    signature: str,
    secret: str,
    *,
    tolerance: int = 300,
) -> Any:
    raw = payload.decode("utf-8") if isinstance(payload, bytes) else payload
    timestamp_str, timestamp, candidates = _parse_signature_header(signature)
    if timestamp_str is None or timestamp is None or not candidates:
        raise VendorvalError(
            "Webhook signature header is malformed.",
            type="webhook_error",
            code="invalid_signature_header",
        )

    age = abs(time.time() - timestamp)
    if age > tolerance:
        raise VendorvalError(
            f"Webhook timestamp is outside the tolerance zone ({age:.0f}s).",
            type="webhook_error",
            code="timestamp_out_of_range",
        )

    # Sign using the *raw* timestamp string from the header so an int sent over
    # the wire never gets rewritten as a float (`1777…` vs `1777….0`).
    expected = _sign(f"{timestamp_str}.{raw}", secret)
    if not any(hmac.compare_digest(c, expected) for c in candidates):
        raise VendorvalError(
            "Webhook signature does not match expected value.",
            type="webhook_error",
            code="signature_mismatch",
        )

    try:
        return json.loads(raw)
    except json.JSONDecodeError as err:
        raise VendorvalError(
            "Webhook payload is not valid JSON.",
            type="webhook_error",
            code="invalid_payload",
        ) from err


def _parse_signature_header(header: str) -> tuple[str | None, float | None, list[str]]:
    timestamp_str: str | None = None
    timestamp: float | None = None
    sigs: list[str] = []
    for part in header.split(","):
        part = part.strip()
        if not part or "=" not in part:
            continue
        k, v = part.split("=", 1)
        if k == "t":
            try:
                timestamp = float(v)
                timestamp_str = v
            except ValueError:
                pass
        elif k == "v1":
            sigs.append(v)
    return timestamp_str, timestamp, sigs


def _sign(message: str, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), message.encode("utf-8"), hashlib.sha256).hexdigest()
