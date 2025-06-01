import { IterableReadableStream } from './iterable-stream-polyfill';
/**
 * Converts an iterator or iterable to a stream.
 *
 * @param iteratorOrIterable The iterator or iterable to convert.
 * @returns A stream that will yield the values from the iterator or iterable.
 */
export declare function iteratorToStream<T>(iteratorOrIterable: AsyncIterator<T> | Iterator<T> | AsyncIterable<T> | Iterable<T>): IterableReadableStream<T>;
