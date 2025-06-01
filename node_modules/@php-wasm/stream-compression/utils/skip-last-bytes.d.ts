/**
 * Skips the first `length` bytes of a stream.
 *
 * @param length The number of bytes to skip.
 * @returns A transform stream that will skip the specified number of bytes.
 */
export declare function skipLastBytes(skip: number, streamLength: number): TransformStream<any, any>;
