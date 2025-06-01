/**
 * Emscripten's filesystem-related Exception.
 *
 * @see https://emscripten.org/docs/api_reference/Filesystem-API.html
 * @see https://github.com/emscripten-core/emscripten/blob/main/system/lib/libc/musl/arch/emscripten/bits/errno.h
 * @see https://github.com/emscripten-core/emscripten/blob/38eedc630f17094b3202fd48ac0c2c585dbea31e/system/include/wasi/api.h#L336
 */
export interface ErrnoError extends Error {
    node?: any;
    errno: number;
    message: string;
}
/**
 * @see https://github.com/emscripten-core/emscripten/blob/38eedc630f17094b3202fd48ac0c2c585dbea31e/system/include/wasi/api.h#L336
 */
export declare const FileErrorCodes: any;
export declare function getEmscriptenFsError(e: any): any;
export declare function rethrowFileSystemError(messagePrefix?: string): (target: any, methodName: string, descriptor: PropertyDescriptor) => void;
