"""Error classes mirroring the VendorVal API error envelope."""

from __future__ import annotations

from email.utils import parsedate_to_datetime
from typing import Any

import httpx


class VendorvalError(Exception):
    """Base class for all SDK errors."""

    def __init__(
        self,
        message: str,
        *,
        status: int = 0,
        type: str = "api_error",
        code: str = "api_error",
        request_id: str | None = None,
        param: str | None = None,
        details: Any = None,
        headers: httpx.Headers | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status = status
        self.type = type
        self.code = code
        self.request_id = request_id
        self.param = param
        self.details = details
        self.headers = headers


class APIError(VendorvalError):
    pass


class AuthenticationError(VendorvalError):
    pass


class PermissionError(VendorvalError):  # noqa: A001 - shadowing builtin is intentional
    pass


class ValidationError(VendorvalError):
    pass


class NotFoundError(VendorvalError):
    pass


class ConflictError(VendorvalError):
    def __init__(self, *args: Any, candidates: list[Any] | None = None, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.candidates = candidates


class RateLimitError(VendorvalError):
    def __init__(self, *args: Any, retry_after: float | None = None, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.retry_after = retry_after


class ProviderError(VendorvalError):
    pass


class APIConnectionError(VendorvalError):
    def __init__(self, message: str, *, request_id: str | None = None) -> None:
        super().__init__(
            message,
            status=0,
            type="connection_error",
            code="connection_error",
            request_id=request_id,
        )


class APITimeoutError(APIConnectionError):
    def __init__(self, timeout: float, *, request_id: str | None = None) -> None:
        super().__init__(f"Request timed out after {timeout}s", request_id=request_id)


_STATUS_TO_CLS: dict[int, type[VendorvalError]] = {
    400: ValidationError,
    401: AuthenticationError,
    403: PermissionError,
    404: NotFoundError,
    429: RateLimitError,
    502: ProviderError,
}


def parse_retry_after(value: str | None) -> float | None:
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        pass
    try:
        dt = parsedate_to_datetime(value)
        from datetime import datetime, timezone

        return max(0.0, (dt - datetime.now(timezone.utc)).total_seconds())
    except (TypeError, ValueError):
        return None


def error_from_response(
    *,
    status: int,
    payload: Any,
    headers: httpx.Headers,
    request_id: str | None,
) -> VendorvalError:
    envelope = None
    if isinstance(payload, dict) and isinstance(payload.get("error"), dict):
        envelope = payload["error"]

    msg = (envelope or {}).get("message") or f"VendorVal API error (status {status})"
    type_ = (envelope or {}).get("type") or "api_error"
    code = (envelope or {}).get("code") or f"http_{status}"
    param = (envelope or {}).get("param")
    details = (envelope or {}).get("details")

    common: dict[str, Any] = dict(
        message=msg,
        status=status,
        type=type_,
        code=code,
        request_id=request_id,
        param=param,
        details=details,
        headers=headers,
    )

    if status == 409:
        candidates = None
        if envelope:
            if isinstance(envelope.get("candidates"), list):
                candidates = envelope["candidates"]
            elif isinstance(envelope.get("details"), dict):
                inner = envelope["details"].get("candidates")
                if isinstance(inner, list):
                    candidates = inner
        return ConflictError(**common, candidates=candidates)

    if status == 429:
        return RateLimitError(
            **common,
            retry_after=parse_retry_after(headers.get("retry-after")),
        )

    cls = _STATUS_TO_CLS.get(status, APIError)
    return cls(**common)
