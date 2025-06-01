/**
 * Appends bytes to a stream.
 *
 * @param bytes The bytes to append.
 * @returns A transform stream that will append the specified bytes.
 */
export declare function appendBytes(bytes: Uint8Array): TransformStream<Uint8Array, Uint8Array>;
