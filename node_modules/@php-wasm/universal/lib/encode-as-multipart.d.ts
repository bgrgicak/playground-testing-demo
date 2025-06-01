/**
 * Encodes a multipart/form-data request body.
 *
 * @param   data - The form data to encode.
 * @returns The encoded body and a correctly formatted content type header.
 */
export declare function encodeAsMultipart(data: Record<string, string | Uint8Array | File>): Promise<{
    bytes: Uint8Array;
    contentType: string;
}>;
