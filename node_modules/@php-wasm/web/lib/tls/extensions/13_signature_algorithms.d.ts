/**
 * TLS signature_algorithms extension
 * https://www.rfc-editor.org/rfc/rfc8446.html#page-41
 */
/**
 * A list of supported signature algorithms,
 * one byte per algorithm.
 */
export type SignatureAlgorithms = Uint8Array;
/**
 * Signature algorithms from
 * https://datatracker.ietf.org/doc/html/rfc5246#section-7.4.1.4.1
 */
export declare const SignatureAlgorithms: {
    anonymous: number;
    rsa: number;
    dsa: number;
    ecdsa: number;
};
export type SignatureAlgorithm = keyof typeof SignatureAlgorithms;
export declare const SignatureAlgorithmsNames: any;
/**
 * Hash algorithms from
 * https://datatracker.ietf.org/doc/html/rfc5246#section-7.4.1.4.1
 */
export declare const HashAlgorithms: {
    none: number;
    md5: number;
    sha1: number;
    sha224: number;
    sha256: number;
    sha384: number;
    sha512: number;
};
export type HashAlgorithm = keyof typeof HashAlgorithms;
export declare const HashAlgorithmsNames: any;
export type ParsedSignatureAlgorithm = {
    hash: HashAlgorithm;
    algorithm: SignatureAlgorithm;
};
/**
 * Handles the signature algorithms extension as defined in
 * https://www.rfc-editor.org/rfc/rfc8446.html#page-41
 */
export declare class SignatureAlgorithmsExtension {
    /**
     * Binary layout:
     *
     * +------------------------------------+
     * | Payload Length              [2B]   |
     * +------------------------------------+
     * | Hash Algorithm 1            [1B]   |
     * | Signature Algorithm 1       [1B]   |
     * +------------------------------------+
     * | Hash Algorithm 2            [1B]   |
     * | Signature Algorithm 2       [1B]   |
     * +------------------------------------+
     * | ...                                |
     * +------------------------------------+
     */
    static decodeFromClient(data: Uint8Array): ParsedSignatureAlgorithm[];
    /**
     * +--------------------------------------------------+
     * | Extension Type (signature_algorithms)     [2B]   |
     * | 0x00 0x0D                                        |
     * +--------------------------------------------------+
     * | Body Length                               [2B]   |
     * +--------------------------------------------------+
     * | Hash Algorithm                            [1B]   |
     * | Signature Algorithm                       [1B]   |
     * +--------------------------------------------------+
     */
    static encodeforClient(hash: HashAlgorithm, algorithm: SignatureAlgorithm): Uint8Array;
}
