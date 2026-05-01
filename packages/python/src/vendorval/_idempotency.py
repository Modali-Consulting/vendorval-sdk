"""Idempotency key helpers."""

from __future__ import annotations

import uuid


def generate_idempotency_key() -> str:
    """Return a UUID4 string suitable for `options.idempotency_key`."""
    return str(uuid.uuid4())
