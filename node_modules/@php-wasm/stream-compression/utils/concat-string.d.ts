/**
 * Concatenate all chunks into a single string.
 *
 * @returns A stream that will emit a single string entry before closing.
 */
export declare function concatString(): TransformStream<string, string>;
