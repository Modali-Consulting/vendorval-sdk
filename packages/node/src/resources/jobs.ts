import { performRequest, type ResolvedClientOptions } from "../request.js";
import type { BulkJob } from "../types/shared.js";

export class JobsResource {
  constructor(private readonly client: ResolvedClientOptions) {}

  async retrieve(id: string): Promise<BulkJob & { _requestId: string | null }> {
    const res = await performRequest<BulkJob>(this.client, {
      method: "GET",
      path: `/v1/jobs/${encodeURIComponent(id)}`,
    });
    return { ...res.data, _requestId: res.requestId };
  }
}
