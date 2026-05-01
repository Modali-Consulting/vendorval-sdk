"""Submit a verification and wait for the terminal status."""

from __future__ import annotations

import os

from vendorval import Vendorval


def main() -> None:
    with Vendorval() as client:
        bundle = client.verifications.create_and_wait(
            identifiers=[{"type": "uei", "value": os.environ.get("VENDORVAL_SMOKE_UEI", "ABCD12345678")}],
            legal_name="Acme Federal Services LLC",
            checks=["sam_registration"],
            mode="cached",
            timeout=60.0,
        )
        v = bundle.verification
        print(f"status={v.get('status')} result={v.get('overall_result', 'n/a')}")


if __name__ == "__main__":
    main()
