import type {
  AddressInput,
  CheckType,
  EntityType,
  IdentifierInput,
  IdentifierType,
  LookupMode,
  SamRefreshMode,
  VerificationMode,
} from "./shared.js";

export interface LookupIdentifiers {
  uei?: string;
  tin?: string;
  duns?: string;
  cage?: string;
  lei?: string;
  /** EU VAT identification number, e.g. "DE123456789". The 2-letter prefix is the country. */
  vat_id?: string;
  name?: string;
  dba?: string;
  domain?: string;
  phone?: string;
  state_registration?: string;
}

export interface LookupRequest {
  identifiers: LookupIdentifiers;
  legal_name?: string;
  mode?: LookupMode;
  /**
   * ISO 3166-1 alpha-2 country code (e.g. "US", "DE"). Optional — when
   * omitted the API resolves it via the precedence chain
   * (identifier inference → org default → 422 country_required).
   * See https://docs.vendorval.com/guides/country-handling.
   */
  country?: string;
  options?: {
    sam_refresh?: SamRefreshMode;
    [key: string]: unknown;
  };
}

export interface LookupRefresh {
  from_cache: boolean;
  age_seconds?: number;
  refreshed_at?: string;
}

export interface LookupResponse {
  match: "found" | "not_found" | "ambiguous" | "fuzzy";
  confidence?: number;
  matched_on?: IdentifierType[] | string[];
  entity: import("./shared.js").Entity | null;
  candidates?: Array<{
    entity: import("./shared.js").Entity;
    score: number;
    matched_identifiers?: string[];
  }>;
  refresh?: LookupRefresh;
}

export interface CreateEntityRequest {
  identifiers: IdentifierInput[];
  legal_name: string;
  entity_type: EntityType;
  country?: string;
  address?: AddressInput;
}

export interface CreateVerificationRequest {
  entity_id: string;
  checks: CheckType[];
  mode?: VerificationMode;
  options?: {
    sync?: boolean;
    webhook_url?: string;
    idempotency_key?: string;
  };
}

// Object-keyed identifier input accepted by `/v1/verify`. Mirrors the keys
// the API allows (the canonical IDENTIFIER_TYPES — `name` and `dba` are
// fuzzy-lookup helpers, not identifiers, so they're excluded here).
export type VerifyIdentifierObject = Omit<LookupIdentifiers, "name" | "dba">;

// `/v1/verify` accepts identifiers as either the recommended object form
// (e.g. `{ uei: "..." }`) or the legacy array of `{type, value}` pairs.
export type VerifyIdentifiers = VerifyIdentifierObject | IdentifierInput[];

export interface VerifyRequest {
  identifiers: VerifyIdentifiers;
  legal_name?: string;
  entity_type?: EntityType;
  country?: string;
  address?: AddressInput;
  checks: CheckType[];
  mode?: VerificationMode;
  options?: {
    sync?: boolean;
    webhook_url?: string;
    idempotency_key?: string;
    create_if_not_found?: boolean;
    match_threshold?: number;
  };
}

export interface CreateMonitorRequest {
  entity_id: string;
  checks: CheckType[];
  cadence: string;
}

export type ListMonitorsQuery = {
  status?: "active" | "paused";
  limit?: number;
};
