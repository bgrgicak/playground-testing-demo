/**
 * This isomorphic class implements the server end of
 * the client <-> server TLS 1.2 connection. It has two ends:
 *
 * * Client end, that emits and accepts TLS encrypted data.
 * * Server end, that emits and accepts unencrypted data.
 *
 * The API consumer is responsible for connecting both ends
 * to the appropriate handlers.
 *
 * See https://datatracker.ietf.org/doc/html/rfc5246.
 *
 * ## Warning
 *
 * **WARNING** NEVER USE THIS CODE AS A SERVER-SIDE TLS HANDLER.
 *
 * This code is not secure. It is a minimal subset required
 * to decrypt the TLS traffic from a PHP-wasm worker. Yes,
 * it can speak TLS. No, it won't protect your data.
 *
 * ## Rationale
 *
 * This is useful for running PHP.wasm in web browsers.
 * Function calls such as `file_get_contents("https://w.org")`
 * emit encrypted TLS traffic. With this class, you
 * can decrypt it, serve the requested data, and encrypt
 * the response before passing it back to the PHP.wasm
 * module.
 *
 * ## Implementation details
 *
 * TLS_1_2_Connection implements the minimal subset of TLS 1.2
 * required to exchange encrypted data with PHP.wasm:
 *
 * * TLS Handshake
 * * All TLS 1.2 record types, including messages spanning multiple
 *   records and empty records.
 * * Encryption and decryption of application data.
 * * Auto-chunking long data blobs before encrypting them to
 *   respect the AES-GCM record size limit.
 *
 * The logic is based on numerous RFCs:
 *
 * * RFC 5246: The TLS Protocol Version 1.2
 * * RFC 8446: TLS 1.3
 * * RFC 6066: TLS Extensions
 * * RFC 4492: Elliptic Curve Cryptography (ECC) Cipher Suites for TLS
 * * RFC 5288: AES Galois Counter Mode (GCM) Cipher Suites for TLS
 * * RFC 6070: PKCS #5: Password-Based Key Derivation Function 2 (PBKDF2) Test Vectors
 *
 * ... and a few others.
 *
 * ## Limitations
 *
 * * Multiple ChangeCipherSpec messages are not supported.
 * * Only uncompressed mode (compression method 0) is supported.
 * * Only the TLS1_CK_ECDHE_RSA_WITH_AES_128_GCM_SHA256 cipher suite is
 *   supported, primarily because `crypto.subtle` supports AES-GCM.
 *   For AES-GCM details, see https://datatracker.ietf.org/doc/html/rfc5288.
 */
export declare class TLS_1_2_Connection {
    /**
     * Sequence number of the last received TLS  record.
     *
     * AES-GCM requires transmitting the sequence number
     * in the clear in the additional data to prevent a
     * potential attacker from re-transmitting the same
     * TLS record in a different context.
     */
    private receivedRecordSequenceNumber;
    /**
     * Sequence number of the last sent TLS record.
     *
     * AES-GCM requires transmitting the sequence number
     * in the clear in the additional data to prevent a
     * potential attacker from re-transmitting the same
     * TLS record in a different context.
     */
    private sentRecordSequenceNumber;
    /**
     * Encryption keys for this connection derived during
     * the TLS handshake.
     */
    private sessionKeys;
    /**
     * Whether this connection have been closed.
     */
    private closed;
    /**
     * Bytes received from the client but not yet parsed
     * as TLS records.
     */
    private receivedBytesBuffer;
    /**
     * TLS records received from the client but not yet
     * parsed as TLS messages.
     */
    private receivedTLSRecords;
    /**
     * TLS messages can span multiple TLS records. This
     * map holds partial TLS messages that are still incomplete
     * after parsing one or more TLS records.
     */
    private partialTLSMessages;
    /**
     * A log of all the exchanged TLS handshake messages.
     * This is required to build the Finished message and
     * verify the integrity of the handshake.
     */
    private handshakeMessages;
    /**
     * Maximum chunk size supported by the cipher suite used
     * in this TLS implementation.
     */
    private MAX_CHUNK_SIZE;
    /**
     * The client end of the TLS connection.
     * This is where the WASM module can write and read the
     * encrypted data.
     */
    clientEnd: {
        upstream: TransformStream<Uint8Array, Uint8Array>;
        downstream: TransformStream<Uint8Array, Uint8Array>;
    };
    private clientDownstreamWriter;
    private clientUpstreamReader;
    /**
     * The server end of the TLS connection.
     * This is where the JavaScript handler can write and read the
     * unencrypted data.
     */
    serverEnd: {
        upstream: TransformStream<Uint8Array, Uint8Array>;
        /**
         * Chunk the data before encrypting it. The
         * TLS1_CK_ECDHE_RSA_WITH_AES_128_GCM_SHA256 cipher suite
         * only supports up to 16KB of data per record.
         *
         * This will spread some messages across multiple records,
         * but TLS supports it so that's fine.
         */
        downstream: TransformStream<any, any>;
    };
    private serverUpstreamWriter;
    constructor();
    /**
     * Marks this connections as closed and closes all the associated
     * streams.
     */
    close(): Promise<void>;
    /**
     * TLS handshake as per RFC 5246.
     *
     * https://datatracker.ietf.org/doc/html/rfc5246#section-7.4
     */
    TLSHandshake(certificatePrivateKey: CryptoKey, certificatesDER: Uint8Array[]): Promise<void>;
    /**
     * Derives the session keys from the random values and the
     * pre-master secret – as per RFC 5246.
     */
    private deriveSessionKeys;
    private readNextHandshakeMessage;
    private readNextMessage;
    private readNextTLSRecord;
    /**
     * Returns the requested number of bytes from the client.
     * Waits for the bytes to arrive if necessary.
     */
    private pollBytes;
    /**
     * Listens for all incoming messages and passes them to the
     * server handler.
     */
    private pollForClientMessages;
    /**
     * Decrypts data in a TLS 1.2-compliant manner using
     * the AES-GCM algorithm.
     */
    private decryptData;
    private accumulateUntilMessageIsComplete;
    /**
     * Passes a TLS record to the client.
     *
     * Accepts unencrypted data and ensures it gets encrypted
     * if needed before sending it to the client. The encryption
     * only kicks in after the handshake is complete.
     */
    private writeTLSRecord;
    /**
     * Encrypts data in a TLS 1.2-compliant manner using
     * the AES-GCM algorithm.
     */
    private encryptData;
}
