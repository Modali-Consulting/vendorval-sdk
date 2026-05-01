/**
 * Abort-aware sleep used by the retry loop and the verification poller.
 *
 *   await sleep(1000);             // plain delay
 *   await sleep(1000, ac.signal);  // throws on signal.abort()
 *
 * `ms <= 0` resolves synchronously (next microtask) so callers can pass
 * `Math.min(interval, deadline - Date.now())` without guarding for negatives.
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  if (signal?.aborted) {
    return Promise.reject(
      signal.reason instanceof Error ? signal.reason : new Error("Aborted"),
    );
  }
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason instanceof Error ? signal.reason : new Error("Aborted"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** Throw the abort reason synchronously if `signal` is already aborted. */
export function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw signal.reason instanceof Error ? signal.reason : new Error("Aborted");
  }
}
