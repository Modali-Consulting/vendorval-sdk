import { performRequest, type ResolvedClientOptions } from "../request.js";
import type { UsageSummary } from "../types/shared.js";

export class UsageResource {
  constructor(private readonly client: ResolvedClientOptions) {}

  async retrieve(orgId: string): Promise<UsageSummary & { _requestId: string | null }> {
    const res = await performRequest<UsageSummary>(this.client, {
      method: "GET",
      path: `/v1/orgs/${encodeURIComponent(orgId)}/usage`,
    });
    return { ...res.data, _requestId: res.requestId };
  }
}
