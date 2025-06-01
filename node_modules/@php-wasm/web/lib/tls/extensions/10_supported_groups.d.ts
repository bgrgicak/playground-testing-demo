/**
 * TLS supported_groups extension
 * https://www.iana.org/go/rfc7919
 * https://www.iana.org/go/rfc8422
 */
export declare const SupportedGroups: {
    readonly secp256r1: 23;
    readonly secp384r1: 24;
    readonly secp521r1: 25;
    readonly x25519: 29;
    readonly x448: 30;
};
export declare const SupportedGroupsNames: any;
export type SupportedGroup = keyof typeof SupportedGroups;
export type ParsedSupportedGroups = (keyof typeof SupportedGroups)[];
export declare class SupportedGroupsExtension {
    /**
     * +--------------------------------------------------+
     * | Payload Length                            [2B]   |
     * +--------------------------------------------------+
     * | Supported Groups List Length              [2B]   |
     * +--------------------------------------------------+
     * | Supported Group 1                         [2B]   |
     * +--------------------------------------------------+
     * | Supported Group 2                         [2B]   |
     * +--------------------------------------------------+
     * | ...                                              |
     * +--------------------------------------------------+
     * | Supported Group n                         [2B]   |
     * +--------------------------------------------------+
     */
    static decodeFromClient(data: Uint8Array): ParsedSupportedGroups;
    /**
     * +--------------------------------------------------+
     * | Extension Type (supported_groups)         [2B]   |
     * | 0x00 0x0A                                        |
     * +--------------------------------------------------+
     * | Extension Length                          [2B]   |
     * +--------------------------------------------------+
     * | Selected Group                            [2B]   |
     * +--------------------------------------------------+
     */
    static encodeForClient(group: SupportedGroup): Uint8Array;
}
