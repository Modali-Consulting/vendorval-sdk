/**
 * AsyncIterable wrapper. Today list endpoints return an array, so we wrap that
 * in an iterator with `.all()` and `[Symbol.asyncIterator]`. When the API
 * grows cursor pagination, the same surface continues to work — callers
 * iterate with `for await` exactly as before.
 */
export class Page<T> implements AsyncIterable<T> {
  constructor(private readonly items: T[]) {}

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    for (const item of this.items) {
      yield item;
    }
  }

  /** Materialize all items into an array. */
  async all(): Promise<T[]> {
    return [...this.items];
  }

  get length(): number {
    return this.items.length;
  }
}
