"""Submit a verification and wait for the terminal status."""

from __future__ import annotations

import os
import sys

from vendorval import Vendorval


def main() -> None:
    api_key = os.environ.get("VENDORVAL_API_KEY")
    if not api_key:
        print(
            "Missing VENDORVAL_API_KEY. Export it before running this example.",
            file=sys.stderr,
        )
        raise SystemExit(1)

    with Vendorval(api_key=api_key) as client:
        # `identifiers` accepts either the recommended object form (shown here)
        # or the legacy list of {"type", "value"} pairs.
        bundle = client.verifications.create_and_wait(
            identifiers={"uei": os.environ.get("VENDORVAL_SMOKE_UEI", "ABCD12345678")},
            legal_name="Acme Federal Services LLC",
            checks=["sam_registration"],
            mode="cached",
            timeout=60.0,
        )
        v = bundle.verification
        print(f"status={v.get('status')} result={v.get('overall_result', 'n/a')}")


if __name__ == "__main__":
    main()
