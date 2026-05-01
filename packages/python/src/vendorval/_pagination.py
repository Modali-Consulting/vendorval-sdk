"""Pagination helpers.

Today list endpoints return arrays. Wrapping in `Page` keeps the
`for item in page` and `async for item in page` shapes stable for when
the API ships cursor pagination.
"""

from __future__ import annotations

from collections.abc import AsyncIterator, Iterator
from typing import Generic, TypeVar

T = TypeVar("T")


class Page(Generic[T]):
    def __init__(self, items: list[T]) -> None:
        self._items = list(items)

    def __iter__(self) -> Iterator[T]:
        return iter(self._items)

    async def __aiter__(self) -> AsyncIterator[T]:
        for item in self._items:
            yield item

    def __len__(self) -> int:
        return len(self._items)

    def __getitem__(self, index: int) -> T:
        return self._items[index]

    def all(self) -> list[T]:
        return list(self._items)
