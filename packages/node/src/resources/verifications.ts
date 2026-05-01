import { APITimeoutError } from "../errors.js";
import { Page } from "../pagination.js";
import { performRequest, type ResolvedClientOptions } from "../request.js";
import type { CreateVerificationRequest, VerifyRequest } from "../types/api.js";
import type { Verification, VerificationBundle } from "../types/shared.js";

const TERMINAL_STATUSES = new Set<Verification["status"]>(["completed", "failed"]);

export interface CreateAndWaitOptions {
  /** Total wait budget in ms. Default 5 minutes. */
  timeout?: number;
  /** Initial poll interval in ms. Doubles up to a 30s cap. */
  pollInterval?: number;
  signal?: AbortSignal;
}

export class VerificationsResource {
  constructor(private readonly client: ResolvedClientOptions) {}

  /**
   * Two flavors of "create" exist on the API:
   *
   *   POST /v1/verifications  — requires entity_id; returns a Verification
   *   POST /v1/verify         — looks up/creates the entity then verifies;
   *                             returns a VerificationBundle (sync 200,
   *                             pending 202, ambiguous 409 → ConflictError)
   *
   * `create()` calls `/v1/verify` because it covers both cases. Use
   * `createForEntity()` when you already have an entity id.
   */
  async create(request: VerifyRequest): Promise<VerificationBundle & { _requestId: string | null; _status: number }> {
    const res = await performRequest<VerificationBundle>(this.client, {
      method: "POST",
      path: "/v1/verify",
      body: request,
      autoIdempotency: true,
    });
    return { ...res.data, _requestId: res.requestId, _status: res.status };
  }

  async createForEntity(
    request: CreateVerificationRequest,
  ): Promise<Verification & { _requestId: string | null; _status: number }> {
    const res = await performRequest<Verification>(this.client, {
      method: "POST",
      path: "/v1/verifications",
      body: request,
      autoIdempotency: true,
    });
    return { ...res.data, _requestId: res.requestId, _status: res.status };
  }

  async retrieve(id: string): Promise<Verification & { _requestId: string | null }> {
    const res = await performRequest<Verification>(this.client, {
      method: "GET",
      path: `/v1/verifications/${encodeURIComponent(id)}`,
    });
    return { ...res.data, _requestId: res.requestId };
  }

  async list(query?: { limit?: number; status?: Verification["status"] }): Promise<Page<Verification>> {
    const res = await performRequest<{ data: Verification[] } | Verification[]>(this.client, {
      method: "GET",
      path: "/v1/verifications",
      query: query as Record<string, string | number | boolean | undefined> | undefined,
    });
    const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
    return new Page(items);
  }

  /**
   * Submit and poll until the verification reaches a terminal status, the
   * timeout elapses, or the signal aborts.
   */
  async createAndWait(
    request: VerifyRequest,
    options: CreateAndWaitOptions = {},
  ): Promise<VerificationBundle> {
    // Honor an already-aborted signal before we make any server-side change.
    throwIfAborted(options.signal);
    const timeoutMs = options.timeout ?? 5 * 60_000;
    const pollMin = options.pollInterval ?? 1_000;
    if (pollMin <= 0) {
      throw new RangeError("pollInterval must be greater than 0");
    }
    const pollMax = 30_000;

    const initial = await this.create(request);
    if (initial.verification.status && TERMINAL_STATUSES.has(initial.verification.status)) {
      return initial;
    }

    const deadline = Date.now() + timeoutMs;
    let interval = pollMin;
    while (Date.now() < deadline) {
      throwIfAborted(options.signal);
      await sleep(Math.min(interval, deadline - Date.now()), options.signal);
      const refreshed = await this.retrieve(initial.verification.id);
      if (TERMINAL_STATUSES.has(refreshed.status)) {
        return {
          object: "verification_bundle",
          entity: initial.entity,
          verification: refreshed,
        };
      }
      interval = Math.min(pollMax, Math.floor(interval * 2));
    }

    throw new APITimeoutError(timeoutMs, initial._requestId);
  }
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw signal.reason instanceof Error ? signal.reason : new Error("Aborted");
  }
}

function sleep(ms: number, signal: AbortSignal | undefined): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason instanceof Error ? signal.reason : new Error("Aborted"));
    };
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        reject(signal.reason instanceof Error ? signal.reason : new Error("Aborted"));
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}
