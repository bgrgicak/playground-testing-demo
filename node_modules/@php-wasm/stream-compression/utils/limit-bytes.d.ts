/**
 * Limit the number of bytes read from a stream.
 *
 * @param stream The stream to limit.
 * @param bytes The number of bytes to read from the stream.
 * @returns A new stream that will read at most `bytes` bytes from `stream`.
 */
export declare function limitBytes(stream: ReadableStream<Uint8Array>, bytes: number): ReadableStream<any>;
