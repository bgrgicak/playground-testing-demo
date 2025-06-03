/**
 * A TransformStream that decodes HTTP chunked transfer encoding.
 * Each chunk starts with the chunk size in hex followed by CRLF,
 * then the chunk data, then CRLF. A chunk size of 0 indicates the end.
 */
export declare class ChunkedDecoderStream extends TransformStream<Uint8Array, Uint8Array> {
    constructor();
}
