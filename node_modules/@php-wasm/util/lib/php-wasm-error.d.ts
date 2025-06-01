export declare class PhpWasmError extends Error {
    userFriendlyMessage?: string | undefined;
    constructor(message: string, userFriendlyMessage?: string | undefined);
}
