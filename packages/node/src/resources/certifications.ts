import { performRequest, type ResolvedClientOptions } from "../request.js";
import type {
  Certification,
  CertificationsListParams,
  CertificationsListResponse,
} from "../types/shared.js";

/**
 * `client.certifications.*` — read access to entity credentials
 * (state MWBE, NMSDC, WBENC, ISO, SOC 2, etc.). Phase N customer-facing
 * reshape, Workstream B.
 *
 * Today this surface is read-only; POST + DELETE (manual upload + revoke)
 * land in a follow-up SDK release once those API routes ship.
 */
export class CertificationsResource {
  constructor(private readonly client: ResolvedClientOptions) {}

  /**
   * List certifications for the calling org. Filters narrow the result
   * set on the server. Returns the full list envelope verbatim so
   * callers see pagination metadata (`total`, `has_more`, `limit`,
   * `offset`) without re-querying for the count.
   *
   * Async iteration helper:
   *
   *   for (const cert of (await client.certifications.list()).data) { … }
   *
   * Cursor pagination is a planned follow-up — when it lands, this
   * shape will accept a `cursor` param + return `next_cursor` without
   * a breaking change.
   */
  async list(
    params: CertificationsListParams = {},
  ): Promise<CertificationsListResponse & { _requestId: string | null }> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params.entity_id !== undefined) query.entity_id = params.entity_id;
    if (params.issuer !== undefined) query.issuer = params.issuer;
    if (params.status !== undefined) query.status = params.status;
    if (params.expiring_within_days !== undefined) {
      query.expiring_within_days = params.expiring_within_days;
    }
    if (params.limit !== undefined) query.limit = params.limit;
    if (params.offset !== undefined) query.offset = params.offset;

    const res = await performRequest<CertificationsListResponse>(this.client, {
      method: "GET",
      path: "/v1/certifications",
      query,
    });

    return { ...res.data, _requestId: res.requestId };
  }

  /**
   * Fetch a single certification by its public id (`cert_…`).
   * Throws a NotFound error if the id doesn't resolve under the
   * caller's org.
   */
  async retrieve(id: string): Promise<Certification & { _requestId: string | null }> {
    const res = await performRequest<Certification>(this.client, {
      method: "GET",
      path: `/v1/certifications/${encodeURIComponent(id)}`,
    });
    return { ...res.data, _requestId: res.requestId };
  }
}
