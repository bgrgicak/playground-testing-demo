export interface SemaphoreOptions {
    /**
     * The maximum number of concurrent locks.
     */
    concurrency: number;
    /**
     * The maximum time to wait for a lock to become available.
     */
    timeout?: number;
}
export declare class AcquireTimeoutError extends Error {
    constructor();
}
export default class Semaphore {
    private _running;
    private concurrency;
    private timeout?;
    private queue;
    constructor({ concurrency, timeout }: SemaphoreOptions);
    get remaining(): number;
    get running(): number;
    acquire(): Promise<() => void>;
    run<T>(fn: () => T | Promise<T>): Promise<T>;
}
