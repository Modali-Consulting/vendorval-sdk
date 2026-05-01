"""Minimal Flask-style webhook handler.

Run with `python main.py` after `pip install flask`. This example deliberately
avoids declaring flask as a hard dep of the SDK; webhook delivery is not
enabled in the API yet.
"""

from __future__ import annotations

import os
import sys

from vendorval import VendorvalError, construct_event


def main() -> None:
    try:
        from flask import Flask, request
    except ImportError:
        print("Install flask first: pip install flask", file=sys.stderr)
        sys.exit(1)

    secret = os.environ.get("VENDORVAL_WEBHOOK_SECRET", "")
    app = Flask(__name__)

    @app.post("/webhook")
    def hook() -> tuple[str, int]:
        signature = request.headers.get("Vendorval-Signature", "")
        try:
            event = construct_event(request.get_data(), signature, secret)
            print("received event", event)
            return "ok", 200
        except VendorvalError as err:
            print("invalid webhook:", err)
            return "invalid", 400

    app.run(port=8787)


if __name__ == "__main__":
    main()
