export interface CachedFetchResponse {
    body: ReadableStream<Uint8Array>;
    responseInit: ResponseInit;
}
/**
 * Creates a fetch function that memoizes the response stream.
 * Calling it twice will return a response with the same status,
 * headers, and the body stream.
 * Memoization is keyed by URL. Method, headers etc are ignored.
 *
 * @param originalFetch The fetch function to memoize. Defaults to the global fetch.
 */
export declare function createMemoizedFetch(originalFetch?: typeof fetch): (url: string, options?: RequestInit) => Promise<Response>;
