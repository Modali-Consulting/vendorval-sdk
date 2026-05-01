"""Live smoke test for the local Python SDK build (../../../packages/python).

Loads `VENDORVAL_API_KEY` (required), `VENDORVAL_UEI` (required), and an
optional `VENDORVAL_BASE_URL` from a `.env` file alongside this script,
then performs a single `entities.lookup` against the live API and prints
the JSON result.
"""

from __future__ import annotations

import json
import os
import sys

from dotenv import load_dotenv
from vendorval import Vendorval


def main() -> None:
    load_dotenv()

    api_key = os.environ.get("VENDORVAL_API_KEY")
    uei = os.environ.get("VENDORVAL_UEI")
    if not api_key or not uei:
        print("Missing VENDORVAL_API_KEY or VENDORVAL_UEI in .env", file=sys.stderr)
        raise SystemExit(1)

    base_url = os.environ.get("VENDORVAL_BASE_URL")
    kwargs: dict[str, str] = {"api_key": api_key}
    if base_url:
        kwargs["base_url"] = base_url

    with Vendorval(**kwargs) as client:
        target = base_url or "https://api.vendorval.com"
        print(f"Looking up UEI {uei} against {target}/v1...")
        result = client.entities.lookup(identifiers={"uei": uei})
        payload = result.to_dict() if hasattr(result, "to_dict") else result
        print(json.dumps(payload, indent=2, default=str))


if __name__ == "__main__":
    main()
