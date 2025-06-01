/**
 * Filter the stream based on a predicate.
 *
 * @param predicate The predicate to filter the stream with.
 * @returns A new stream that will only contain chunks that pass the predicate.
 */
export declare function filterStream<T>(predicate: (chunk: T) => boolean): TransformStream<T, T>;
