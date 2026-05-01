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

export interface VerifyRequest {
  identifiers: IdentifierInput[];
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
