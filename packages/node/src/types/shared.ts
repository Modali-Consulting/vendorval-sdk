/**
 * Shared types mirroring vendorval-api/packages/common/src/types.
 * Kept loose where the API surface is unstable (refresh, sources) so SDK
 * consumers can opt into stricter shapes once the spec stabilizes.
 */

export type IdentifierType =
  | "uei"
  | "tin"
  | "duns"
  | "cage"
  | "lei"
  | "vat_id"
  | "name"
  | "dba"
  | "domain"
  | "phone"
  | "state_registration";

export type CheckType =
  | "sam_registration"
  | "uei_validation"
  | "tin_match"
  | "vat_validation"
  | "lei_validation"
  | "sanctions_screening";

/**
 * ISO 3166-1 alpha-2 country codes the API currently supports.
 * Mirrors `vendorval-api/packages/common/src/country/supported-countries.ts`.
 * The full list is also discoverable at runtime via `client.meta.listSupportedCountries()`.
 */
export type CountryCode =
  | "US"
  // EU 27
  | "AT" | "BE" | "BG" | "CY" | "CZ" | "DE" | "DK" | "EE" | "ES" | "FI"
  | "FR" | "GR" | "HR" | "HU" | "IE" | "IT" | "LT" | "LU" | "LV" | "MT"
  | "NL" | "PL" | "PT" | "RO" | "SE" | "SI" | "SK";

export type EntityRegion = "north_america" | "european_union";

export type CountryTier = "full" | "limited";

export interface SupportedCountrySummary {
  code: CountryCode;
  name: string;
  region: EntityRegion;
  tier: CountryTier;
  available_identifiers: IdentifierType[];
  available_checks: CheckType[];
}

export interface SupportedCountriesResponse {
  object: "list";
  total_count: number;
  data: SupportedCountrySummary[];
}

export type VerificationMode = "cached" | "realtime";

export type EntityType =
  | "corporation"
  | "llc"
  | "partnership"
  | "sole_proprietorship"
  | "nonprofit"
  | "government"
  | "individual"
  | "other";

export type LookupMode = "exact" | "fuzzy";

export type SamRefreshMode = "auto" | "force" | "never";

export interface IdentifierInput {
  type: IdentifierType;
  value: string;
}

export interface AddressInput {
  line_1?: string;
  line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface IdentifierRecord {
  id: string;
  entity_id: string;
  type: IdentifierType;
  value: string;
  verified?: boolean;
  confidence?: number;
  issuer?: string | null;
  source?: string | null;
  first_seen_at: string;
  last_seen_at: string;
}

export interface AddressRecord {
  id: string;
  entity_id: string;
  type: string;
  line_1?: string | null;
  line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  created_at: string;
}

export interface Entity {
  object: "entity";
  id: string;
  legal_name: string;
  normalized_name?: string;
  entity_type: EntityType;
  status?: string;
  country: string;
  confidence?: number;
  created_at: string;
  updated_at: string;
  identifiers: IdentifierRecord[];
  addresses: AddressRecord[];
  sam_gov?: Record<string, unknown> | null;
  sources?: Array<Record<string, unknown>>;
}

export interface VerificationResult {
  check_type: CheckType;
  status: "pass" | "fail" | "inconclusive";
  confidence?: number;
  origin?: string;
  determinism?: string;
  data_freshness_seconds?: number;
  evidence_uri?: string;
  details?: Record<string, unknown>;
}

export interface Verification {
  object: "verification";
  id: string;
  entity_id: string;
  status: "pending" | "running" | "completed" | "failed";
  overall_result?: "pass" | "fail" | "inconclusive";
  checks_requested: CheckType[];
  mode: VerificationMode;
  results: VerificationResult[];
  webhook_url?: string | null;
  idempotency_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VerificationBundle {
  object: "verification_bundle";
  entity: Entity;
  verification: Verification;
}

export interface UsageSummary {
  org_id: string;
  period_start: string;
  period_end: string;
  used: number;
  quota?: number | null;
  overage?: number;
}

export interface Provider {
  name: string;
  display_name?: string;
  status?: string;
  capabilities: Array<{
    check_type: CheckType;
    enabled: boolean;
    priority: number;
  }>;
}

export interface Monitor {
  object: "monitor";
  id: string;
  entity_id: string;
  checks: CheckType[];
  cadence: string;
  status: "active" | "paused" | "deleted";
  created_at: string;
  updated_at: string;
}

export interface MonitorEvent {
  id: string;
  monitor_id: string;
  type: string;
  detected_at: string;
  payload?: Record<string, unknown>;
}

export interface BulkJob {
  object: "bulk_job";
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  total?: number;
  succeeded?: number;
  failed?: number;
  result_url?: string | null;
}
