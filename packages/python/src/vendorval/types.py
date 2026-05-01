"""Public type aliases mirroring the API response shapes.

Kept loose where the API surface is unstable. Consumers can `cast` to these
TypedDicts for editor support without committing to strict shapes.
"""

from __future__ import annotations

import sys
from typing import Any, Literal

if sys.version_info >= (3, 11):
    from typing import TypedDict
else:
    from typing_extensions import TypedDict


IdentifierType = Literal[
    "uei", "tin", "duns", "cage", "lei", "name", "dba", "domain", "phone", "state_registration"
]
CheckType = Literal["sam_registration", "uei_validation", "tin_match"]
VerificationMode = Literal["cached", "realtime"]
EntityType = Literal[
    "corporation",
    "llc",
    "partnership",
    "sole_proprietorship",
    "nonprofit",
    "government",
    "individual",
    "other",
]
LookupMode = Literal["exact", "fuzzy"]
SamRefreshMode = Literal["auto", "force", "never"]


class IdentifierInput(TypedDict):
    type: IdentifierType
    value: str


class AddressInput(TypedDict, total=False):
    line_1: str
    line_2: str
    city: str
    state: str
    postal_code: str
    country: str


class IdentifierRecord(TypedDict, total=False):
    id: str
    entity_id: str
    type: IdentifierType
    value: str
    verified: bool
    confidence: float
    issuer: str | None
    source: str | None
    first_seen_at: str
    last_seen_at: str


class Entity(TypedDict, total=False):
    object: Literal["entity"]
    id: str
    legal_name: str
    normalized_name: str
    entity_type: EntityType
    status: str
    country: str
    confidence: float
    created_at: str
    updated_at: str
    identifiers: list[IdentifierRecord]
    addresses: list[Any]
    sam_gov: Any | None
    sources: list[Any]


class VerificationResult(TypedDict, total=False):
    check_type: CheckType
    status: Literal["pass", "fail", "inconclusive"]
    confidence: float
    origin: str
    determinism: str
    data_freshness_seconds: int
    evidence_uri: str
    details: Any


class Verification(TypedDict, total=False):
    object: Literal["verification"]
    id: str
    entity_id: str
    status: Literal["pending", "running", "completed", "failed"]
    overall_result: Literal["pass", "fail", "inconclusive"]
    checks_requested: list[CheckType]
    mode: VerificationMode
    results: list[VerificationResult]
    webhook_url: str | None
    idempotency_key: str | None
    created_at: str
    updated_at: str


class VerificationBundle(TypedDict):
    object: Literal["verification_bundle"]
    entity: Entity
    verification: Verification
