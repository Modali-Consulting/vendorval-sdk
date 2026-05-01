import { Page } from "../pagination.js";
import { performRequest, type ResolvedClientOptions } from "../request.js";
import type { Provider } from "../types/shared.js";

export class ProvidersResource {
  constructor(private readonly client: ResolvedClientOptions) {}

  async list(): Promise<Page<Provider>> {
    const res = await performRequest<{ data: Provider[] } | Provider[]>(this.client, {
      method: "GET",
      path: "/v1/providers",
    });
    const items = Array.isArray(res.data) ? res.data : res.data.data ?? [];
    return new Page(items);
  }
}
