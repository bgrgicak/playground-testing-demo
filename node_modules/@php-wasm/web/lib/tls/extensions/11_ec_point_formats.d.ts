/**
 * TLS ec_point_formats extension
 * https://www.rfc-editor.org/rfc/rfc4492#section-5.1.2
 */
export declare const ECPointFormats: {
    readonly uncompressed: 0;
    readonly ansiX962_compressed_prime: 1;
    readonly ansiX962_compressed_char2: 2;
};
export type ECPointFormat = keyof typeof ECPointFormats;
export declare const ECPointFormatNames: any;
export type ParsedECPointFormats = (keyof typeof ECPointFormats)[];
export declare class ECPointFormatsExtension {
    /**
     * +--------------------------------------------------+
     * | Payload Length                            [2B]   |
     * +--------------------------------------------------+
     * | EC Point Formats Length                   [1B]   |
     * +--------------------------------------------------+
     * | EC Point Format 1                         [1B]   |
     * +--------------------------------------------------+
     * | EC Point Format 2                         [1B]   |
     * +--------------------------------------------------+
     * | ...                                              |
     * +--------------------------------------------------+
     * | EC Point Format n                         [1B]   |
     * +--------------------------------------------------+
     */
    static decodeFromClient(data: Uint8Array): ParsedECPointFormats;
    /**
     * Encode the ec_point_formats extension
     *
     * +--------------------------------------------------+
     * | Extension Type (ec_point_formats)         [2B]   |
     * | 0x00 0x0B                                        |
     * +--------------------------------------------------+
     * | Body Length                               [2B]   |
     * +--------------------------------------------------+
     * | EC Point Format Length                    [1B]   |
     * +--------------------------------------------------+
     * | EC Point Format                           [1B]   |
     * +--------------------------------------------------+
     */
    static encodeForClient(format: ECPointFormat): Uint8Array;
}
