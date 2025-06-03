export interface CacheEntry {
    responsePromise: Promise<Response>;
    unlockedBodyStream?: ReadableStream<Uint8Array>;
    nextResponse: () => Promise<Response>;
}
/**
 * Creates a fetch function that memoizes the response stream.
 * Calling it twice will return a response with the same status,
 * headers, and the body stream.
 * Memoization is keyed by URL. Method, headers etc are ignored.
 *
 * @param originalFetch The fetch function to memoize. Defaults to the global fetch.
 */
export declare function createMemoizedFetch(originalFetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>): (url: string, options?: RequestInit) => Promise<Response>;
