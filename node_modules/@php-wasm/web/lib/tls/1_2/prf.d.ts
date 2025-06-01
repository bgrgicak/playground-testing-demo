/**
 * Implements the TLS 1.2 PRF using HMAC-SHA256.
 *
 * See https://datatracker.ietf.org/doc/html/rfc5246#section-5
 */
export declare function tls12Prf(secret: ArrayBuffer, label: ArrayBuffer, seed: ArrayBuffer, outputLength: number): Promise<ArrayBuffer>;
export declare function hmacSha256(key: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer>;
