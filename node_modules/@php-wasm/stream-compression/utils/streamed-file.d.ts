/**
 * Represents a file that is streamed and not fully
 * loaded into memory.
 */
export declare class StreamedFile extends File {
    private readableStream;
    /**
     * Creates a new StreamedFile instance.
     *
     * @param readableStream The readable stream containing the file data.
     * @param name The name of the file.
     * @param type The MIME type of the file.
     */
    constructor(readableStream: ReadableStream<Uint8Array>, name: string, type?: string);
    /**
     * Overrides the slice() method of the File class.
     *
     * @returns A Blob representing a portion of the file.
     */
    slice(): Blob;
    /**
     * Returns the readable stream associated with the file.
     *
     * @returns The readable stream.
     */
    stream(): ReadableStream<Uint8Array>;
    /**
     * Loads the file data into memory and then returns it as a string.
     *
     * @returns File data as text.
     */
    text(): Promise<string>;
    /**
     * Loads the file data into memory and then returns it as an ArrayBuffer.
     *
     * @returns File data as an ArrayBuffer.
     */
    arrayBuffer(): Promise<Uint8Array>;
}
