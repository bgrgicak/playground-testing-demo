export interface PHPResponseData {
    /**
     * Response headers.
     */
    readonly headers: Record<string, string[]>;
    /**
     * Response body. Contains the output from `echo`,
     * `print`, inline HTML etc.
     */
    readonly bytes: ArrayBuffer;
    /**
     * Stderr contents, if any.
     */
    readonly errors: string;
    /**
     * The exit code of the script. `0` is a success, while
     * `1` and `2` indicate an error.
     */
    readonly exitCode: number;
    /**
     * Response HTTP status code, e.g. 200.
     */
    readonly httpStatusCode: number;
}
/**
 * PHP response. Body is an `ArrayBuffer` because it can
 * contain binary data.
 *
 * This type is used in Comlink.transferHandlers.set('PHPResponse', \{ ... \})
 * so be sure to update that if you change this type.
 */
export declare class PHPResponse implements PHPResponseData {
    /** @inheritDoc */
    readonly headers: Record<string, string[]>;
    /** @inheritDoc */
    readonly bytes: ArrayBuffer;
    /** @inheritDoc */
    readonly errors: string;
    /** @inheritDoc */
    readonly exitCode: number;
    /** @inheritDoc */
    readonly httpStatusCode: number;
    constructor(httpStatusCode: number, headers: Record<string, string[]>, body: ArrayBuffer, errors?: string, exitCode?: number);
    static forHttpCode(httpStatusCode: number, text?: string): PHPResponse;
    static fromRawData(data: PHPResponseData): PHPResponse;
    toRawData(): PHPResponseData;
    /**
     * Response body as JSON.
     */
    get json(): any;
    /**
     * Response body as text.
     */
    get text(): string;
}
