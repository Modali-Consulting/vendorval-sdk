"""Quickstart example. Run with VENDORVAL_API_KEY set."""

from __future__ import annotations

import json
import os
import sys

from vendorval_sdk import Vendorval


def main() -> None:
    api_key = os.environ.get("VENDORVAL_API_KEY")
    if not api_key:
        print(
            "Missing VENDORVAL_API_KEY. Export it before running this example.",
            file=sys.stderr,
        )
        raise SystemExit(1)

    with Vendorval(api_key=api_key) as client:
        result = client.entities.lookup(
            identifiers={"uei": os.environ.get("VENDORVAL_SMOKE_UEI", "ABCD12345678")},
        )
        print(json.dumps(result.to_dict(), indent=2))


if __name__ == "__main__":
    main()
