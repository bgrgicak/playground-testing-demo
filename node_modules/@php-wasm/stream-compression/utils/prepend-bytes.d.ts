/**
 * Prepend bytes to a stream.
 *
 * @param bytes The bytes to prepend.
 * @returns A transform stream that will prepend the specified bytes.
 */
export declare function prependBytes(bytes: Uint8Array): TransformStream<Uint8Array, Uint8Array>;
