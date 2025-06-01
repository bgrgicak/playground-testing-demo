/**
 * Compresses the given files into a ZIP archive.
 *
 * @param files - An async or sync iterable of files to be compressed.
 * @returns A readable stream of the compressed ZIP archive as Uint8Array chunks.
 */
export declare function encodeZip(files: AsyncIterable<File> | Iterable<File>): ReadableStream<Uint8Array>;
