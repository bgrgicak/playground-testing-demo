/**
 * Reads files from a stream of zip file bytes.
 */
import { IterableReadableStream } from '../utils/iterable-stream-polyfill';
import { CentralDirectoryEntry, FileEntry } from './types';
/**
 * Unzips a stream of zip file bytes.
 *
 * @param stream A stream of zip file bytes.
 * @param predicate Optional. A function that returns true if the file should be downloaded.
 * @returns An iterable stream of File objects.
 */
export declare function decodeZip(stream: ReadableStream<Uint8Array>, predicate?: () => boolean): IterableReadableStream<File>;
/**
 * Parses a stream of zipped bytes into FileEntry informations.
 *
 * @param stream A stream of zip file bytes.
 * @param predicate Optional. A function that returns true if the file should be downloaded.
 * @returns An iterable stream of FileEntry objects.
 */
export declare function streamZippedFileEntries(stream: ReadableStream<Uint8Array>, predicate?: (dirEntry: CentralDirectoryEntry | FileEntry) => boolean): IterableReadableStream<FileEntry>;
/**
 * Reads a file entry from a zip file.
 *
 * The file entry is structured as follows:
 *
 * ```
 * Offset	Bytes	Description
 *   0		4	Local file header signature = 0x04034b50 (PK♥♦ or "PK\3\4")
 *   4		2	Version needed to extract (minimum)
 *   6		2	General purpose bit flag
 *   8		2	Compression method; e.g. none = 0, DEFLATE = 8 (or "\0x08\0x00")
 *   10		2	File last modification time
 *   12		2	File last modification date
 *   14		4	CRC-32 of uncompressed data
 *   18		4	Compressed size (or 0xffffffff for ZIP64)
 *   22		4	Uncompressed size (or 0xffffffff for ZIP64)
 *   26		2	File name length (n)
 *   28		2	Extra field length (m)
 *   30		n	File name
 *   30+n	m	Extra field
 * ```
 *
 * @param stream
 * @param skipSignature Do not consume the signature from the stream.
 * @returns
 */
export declare function readFileEntry(stream: ReadableStream<Uint8Array>, skipSignature?: boolean): Promise<FileEntry | null>;
/**
 * Reads a central directory entry from a zip file.
 *
 * The central directory entry is structured as follows:
 *
 * ```
 * Offset Bytes Description
 *   0		4	Central directory file header signature = 0x02014b50
 *   4		2	Version made by
 *   6		2	Version needed to extract (minimum)
 *   8		2	General purpose bit flag
 *   10		2	Compression method
 *   12		2	File last modification time
 *   14		2	File last modification date
 *   16		4	CRC-32 of uncompressed data
 *   20		4	Compressed size (or 0xffffffff for ZIP64)
 *   24		4	Uncompressed size (or 0xffffffff for ZIP64)
 *   28		2	File name length (n)
 *   30		2	Extra field length (m)
 *   32		2	File comment length (k)
 *   34		2	Disk number where file starts (or 0xffff for ZIP64)
 *   36		2	Internal file attributes
 *   38		4	External file attributes
 *   42		4	Relative offset of local file header (or 0xffffffff for ZIP64). This is the number of bytes between the start of the first disk on which the file occurs, and the start of the local file header. This allows software reading the central directory to locate the position of the file inside the ZIP file.
 *   46		n	File name
 *   46+n	m	Extra field
 *   46+n+m	k	File comment
 * ```
 *
 * @param stream
 * @param skipSignature
 * @returns
 */
export declare function readCentralDirectoryEntry(stream: ReadableStream<Uint8Array>, skipSignature?: boolean): Promise<CentralDirectoryEntry | null>;
