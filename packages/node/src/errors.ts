/**
 * Error envelope mirrors `vendorval-api/packages/common/src/errors/api-errors.ts`:
 *   { error: { type, code, message, param?, details? } }
 */

export interface ApiErrorPayload {
  error: {
    type: string;
    code: string;
    message: string;
    param?: string;
    details?: unknown;
    candidates?: unknown;
  };
}

export interface VendorvalErrorInit {
  message: string;
  status: number;
  type: string;
  code: string;
  requestId: string | null;
  param?: string | undefined;
  details?: unknown;
  headers?: Headers | undefined;
}

export class VendorvalError extends Error {
  readonly status: number;
  readonly type: string;
  readonly code: string;
  readonly requestId: string | null;
  readonly param: string | undefined;
  readonly details: unknown;
  readonly headers: Headers | undefined;

  constructor(init: VendorvalErrorInit) {
    super(init.message);
    this.name = new.target.name;
    this.status = init.status;
    this.type = init.type;
    this.code = init.code;
    this.requestId = init.requestId;
    this.param = init.param;
    this.details = init.details;
    this.headers = init.headers;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class APIError extends VendorvalError {}

export class AuthenticationError extends VendorvalError {}

export class PermissionError extends VendorvalError {}

export class ValidationError extends VendorvalError {}

export class NotFoundError extends VendorvalError {}

export class ConflictError extends VendorvalError {
  readonly candidates: unknown[] | undefined;

  constructor(init: VendorvalErrorInit & { candidates?: unknown[] | undefined }) {
    super(init);
    this.candidates = init.candidates;
  }
}

export class RateLimitError extends VendorvalError {
  /** Retry-After in seconds, when the API supplied it. */
  readonly retryAfter: number | undefined;

  constructor(init: VendorvalErrorInit & { retryAfter?: number | undefined }) {
    super(init);
    this.retryAfter = init.retryAfter;
  }
}

export class ProviderError extends VendorvalError {}

export class APIConnectionError extends VendorvalError {
  constructor(message: string, requestId: string | null = null) {
    super({
      message,
      status: 0,
      type: "connection_error",
      code: "connection_error",
      requestId,
    });
  }
}

export class APITimeoutError extends APIConnectionError {
  constructor(timeoutMs: number, requestId: string | null = null) {
    super(`Request timed out after ${timeoutMs}ms`, requestId);
  }
}

const STATUS_CONSTRUCTORS: Record<number, new (init: VendorvalErrorInit) => VendorvalError> = {
  400: ValidationError,
  401: AuthenticationError,
  403: PermissionError,
  404: NotFoundError,
  429: RateLimitError,
  502: ProviderError,
};

export function errorFromResponse(args: {
  status: number;
  payload: unknown;
  headers: Headers;
  requestId: string | null;
  fallbackMessage?: string;
}): VendorvalError {
  const { status, payload, headers, requestId } = args;
  const envelope = isApiErrorPayload(payload) ? payload.error : null;

  const type = envelope?.type ?? "api_error";
  const code = envelope?.code ?? `http_${status}`;
  const message =
    envelope?.message ??
    args.fallbackMessage ??
    `VendorVal API error (status ${status})`;
  const param = envelope?.param;
  const details = envelope?.details;

  const init: VendorvalErrorInit = {
    message,
    status,
    type,
    code,
    requestId,
    param,
    details,
    headers,
  };

  if (status === 409) {
    return new ConflictError({
      ...init,
      candidates: extractCandidates(envelope),
    });
  }

  if (status === 429) {
    return new RateLimitError({
      ...init,
      retryAfter: parseRetryAfter(headers),
    });
  }

  const Ctor = STATUS_CONSTRUCTORS[status] ?? APIError;
  return new Ctor(init);
}

function isApiErrorPayload(payload: unknown): payload is ApiErrorPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as Record<string, unknown>).error === "object"
  );
}

function extractCandidates(envelope: ApiErrorPayload["error"] | null): unknown[] | undefined {
  if (!envelope) return undefined;
  if (Array.isArray(envelope.candidates)) return envelope.candidates;
  // /v1/verify embeds candidates directly in the error envelope (see verify.ts:200).
  if (envelope.details && typeof envelope.details === "object" && "candidates" in (envelope.details as object)) {
    const c = (envelope.details as { candidates?: unknown }).candidates;
    if (Array.isArray(c)) return c;
  }
  return undefined;
}

export function parseRetryAfter(headers: Headers): number | undefined {
  const raw = headers.get("retry-after");
  if (!raw) return undefined;
  // Per RFC 7231, Retry-After is either delta-seconds or HTTP-date.
  const seconds = Number.parseInt(raw, 10);
  if (Number.isFinite(seconds) && !Number.isNaN(seconds)) {
    return seconds;
  }
  const epoch = Date.parse(raw);
  if (Number.isFinite(epoch)) {
    return Math.max(0, Math.ceil((epoch - Date.now()) / 1000));
  }
  return undefined;
}
