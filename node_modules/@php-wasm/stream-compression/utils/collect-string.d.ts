/**
 * Collects the contents of the entire stream into a single string.
 *
 * @param stream The stream to collect.
 * @param bytes Optional. The number of bytes to read from the stream.
 * @returns The string contents of the stream.
 */
export declare function collectString(stream: ReadableStream<Uint8Array>, bytes?: number): Promise<string | undefined>;
