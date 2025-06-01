type Runtime = {
    wasmExports: Record<string, unknown>;
    lastAsyncifyStackSource?: Error;
};
export declare class UnhandledRejectionsTarget extends EventTarget {
    listenersCount: number;
    addEventListener(type: unknown, callback: unknown): void;
    removeEventListener(type: unknown, callback: unknown): void;
    hasListeners(): boolean;
}
/**
 * Creates Asyncify errors listener.
 *
 * Emscripten turns Asyncify errors into unhandled rejections by
 * throwing them outside of the context of the original function call.
 *
 * With this listener, we can catch and rethrow them in a proper context,
 * or at least log them in a more readable way.
 *
 * @param runtime
 */
export declare function improveWASMErrorReporting(runtime: Runtime): UnhandledRejectionsTarget;
export declare function getFunctionsMaybeMissingFromAsyncify(): string[];
export declare function clarifyErrorMessage(crypticError: Error, asyncifyStack?: string): string;
export declare function showCriticalErrorBox(message: string): void;
export {};
