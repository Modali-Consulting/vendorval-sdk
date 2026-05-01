import { Page } from "../pagination.js";
import { performRequest, type ResolvedClientOptions } from "../request.js";
import type { CreateMonitorRequest, ListMonitorsQuery } from "../types/api.js";
import type { Monitor, MonitorEvent } from "../types/shared.js";

export class MonitorsResource {
  constructor(private readonly client: ResolvedClientOptions) {}

  async create(request: CreateMonitorRequest): Promise<Monitor & { _requestId: string | null }> {
    const res = await performRequest<Monitor>(this.client, {
      method: "POST",
      path: "/v1/monitors",
      body: request,
      autoIdempotency: true,
    });
    return { ...res.data, _requestId: res.requestId };
  }

  async retrieve(id: string): Promise<Monitor & { _requestId: string | null }> {
    const res = await performRequest<Monitor>(this.client, {
      method: "GET",
      path: `/v1/monitors/${encodeURIComponent(id)}`,
    });
    return { ...res.data, _requestId: res.requestId };
  }

  async list(query: ListMonitorsQuery = {}): Promise<Page<Monitor>> {
    const res = await performRequest<{ data: Monitor[] } | Monitor[]>(this.client, {
      method: "GET",
      path: "/v1/monitors",
      query: query as Record<string, string | number | boolean | undefined>,
    });
    const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
    return new Page(items);
  }

  async delete(id: string): Promise<void> {
    await performRequest<void>(this.client, {
      method: "DELETE",
      path: `/v1/monitors/${encodeURIComponent(id)}`,
    });
  }

  async events(id: string): Promise<Page<MonitorEvent>> {
    const res = await performRequest<{ data: MonitorEvent[] } | MonitorEvent[]>(this.client, {
      method: "GET",
      path: `/v1/monitors/${encodeURIComponent(id)}/events`,
    });
    const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
    return new Page(items);
  }
}
