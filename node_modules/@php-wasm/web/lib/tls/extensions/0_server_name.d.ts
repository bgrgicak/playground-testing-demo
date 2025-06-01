/**
 * TLS server_name extension
 * https://www.rfc-editor.org/rfc/rfc6066.html
 */
export interface ServerNameList {
    server_name_list: ServerName[];
}
export interface ServerName {
    name_type: typeof ServerNameTypes;
    name: {
        host_name: string;
    };
}
export declare const ServerNameTypes: {
    readonly host_name: 0;
};
export type ServerNameType = (typeof ServerNameTypes)[keyof typeof ServerNameTypes];
export declare const ServerNameNames: any;
export declare class ServerNameExtension {
    static decodeFromClient(data: Uint8Array): ServerNameList;
    /**
     * Encode the server_name extension
     *
     * +------------------------------------+
     * | Extension Type (server_name) [2B]  |
     * | 0x00 0x00                          |
     * +------------------------------------+
     * | Extension Length             [2B]  |
     * | 0x00 0x00                          |
     * +------------------------------------+
     */
    static encodeForClient(serverNames?: ServerNameList): Uint8Array;
}
