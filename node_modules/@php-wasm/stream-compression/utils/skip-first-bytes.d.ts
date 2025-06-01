/**
 * Skips the first `length` bytes of a stream.
 *
 * @param length The number of bytes to skip.
 * @returns A transform stream that will skip the specified number of bytes.
 */
export declare function skipFirstBytes(length: number): TransformStream<Uint8Array, Uint8Array>;
