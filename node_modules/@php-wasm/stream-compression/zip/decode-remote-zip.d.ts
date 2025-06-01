import { CentralDirectoryEntry, FileEntry } from './types';
import { IterableReadableStream } from '../utils/iterable-stream-polyfill';
/**
 * Streams the contents of a remote zip file.
 *
 * If the zip is large and the predicate is filtering the zip contents,
 * only the matching files will be downloaded using the Range header
 * (if supported by the server).
 *
 * @param url The URL of the zip file.
 * @param predicate Optional. A function that returns true if the file should be downloaded.
 * @returns A stream of zip entries.
 */
export declare function decodeRemoteZip(url: string, predicate?: (dirEntry: CentralDirectoryEntry | FileEntry) => boolean): Promise<IterableReadableStream<FileEntry> | IterableReadableStream<File>>;
