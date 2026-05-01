"""Lightweight response wrappers that expose `request_id`.

Kept as `__getattr__`-backed dict facades so we don't tie the SDK to a strict
schema while the API is still stabilizing.
"""

from __future__ import annotations

from typing import Any


class Response:
    """Dict-backed object that exposes the API response plus `_request_id`."""

    __slots__ = ("_data", "_request_id", "_status")

    def __init__(self, data: Any, request_id: str | None, status: int) -> None:
        self._data = data if isinstance(data, dict) else {}
        self._request_id = request_id
        self._status = status

    def __getattr__(self, name: str) -> Any:
        try:
            return self._data[name]
        except KeyError as err:
            raise AttributeError(name) from err

    def __getitem__(self, key: str) -> Any:
        return self._data[key]

    def __contains__(self, key: str) -> bool:
        return key in self._data

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, default)

    def to_dict(self) -> dict[str, Any]:
        return dict(self._data)

    @property
    def request_id(self) -> str | None:
        return self._request_id

    @property
    def status(self) -> int:
        return self._status

    def __repr__(self) -> str:
        return f"<Response request_id={self._request_id!r} status={self._status}>"


class VerificationBundleResponse(Response):
    @property
    def entity(self) -> Response:
        return Response(self._data.get("entity"), self._request_id, self._status)

    @property
    def verification(self) -> Response:
        return Response(self._data.get("verification"), self._request_id, self._status)
