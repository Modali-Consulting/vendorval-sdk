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
    const items = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : null;
    if (!items) {
      throw new Error(
        "Unexpected /v1/providers response shape — expected an array or { data: [...] }",
      );
    }
    return new Page(items);
  }
}
