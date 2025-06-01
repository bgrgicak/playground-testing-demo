/**
 * Concatenates the contents of the stream into a single Uint8Array.
 *
 * @param totalBytes Optional. The number of bytes to concatenate. Used to
 *  				 pre-allocate the buffer. If not provided, the buffer will
 * 				     be dynamically resized as needed.
 * @returns A stream that will emit a single UInt8Array entry before closing.
 */
export declare function concatBytes(totalBytes?: number): TransformStream<Uint8Array, Uint8Array>;
