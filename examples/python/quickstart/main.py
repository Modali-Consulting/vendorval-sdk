"""Quickstart example. Run with VENDORVAL_API_KEY set."""

from __future__ import annotations

import json
import os

from vendorval import Vendorval


def main() -> None:
    with Vendorval() as client:
        result = client.entities.lookup(
            identifiers={"uei": os.environ.get("VENDORVAL_SMOKE_UEI", "ABCD12345678")},
        )
        print(json.dumps(result.to_dict(), indent=2))


if __name__ == "__main__":
    main()
