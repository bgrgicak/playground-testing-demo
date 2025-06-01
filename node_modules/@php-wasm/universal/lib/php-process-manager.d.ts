import { PHP } from './php';
export type PHPFactoryOptions = {
    isPrimary: boolean;
};
export type PHPFactory = (options: PHPFactoryOptions) => Promise<PHP>;
export interface ProcessManagerOptions {
    /**
     * The maximum number of PHP instances that can exist at
     * the same time.
     */
    maxPhpInstances?: number;
    /**
     * The number of milliseconds to wait for a PHP instance when
     * we have reached the maximum number of PHP instances and
     * cannot spawn a new one. If the timeout is reached, we assume
     * all the PHP instances are deadlocked and a throw MaxPhpInstancesError.
     *
     * Default: 5000
     */
    timeout?: number;
    /**
     * The primary PHP instance that's never killed. This instance
     * contains the reference filesystem used by all other PHP instances.
     */
    primaryPhp?: PHP;
    /**
     * A factory function used for spawning new PHP instances.
     */
    phpFactory?: PHPFactory;
}
export interface SpawnedPHP {
    php: PHP;
    reap: () => void;
}
export declare class MaxPhpInstancesError extends Error {
    constructor(limit: number);
}
/**
 * A PHP Process manager.
 *
 * Maintains:
 * * A single "primary" PHP instance that's never killed – it contains the
 *   reference filesystem used by all other PHP instances.
 * * A pool of disposable PHP instances that are spawned to handle a single
 *   request and reaped immediately after.
 *
 * When a new request comes in, PHPProcessManager yields the idle instance to
 * handle it, and immediately starts initializing a new idle instance. In other
 * words, for n concurrent requests, there are at most n+1 PHP instances
 * running at the same time.
 *
 * A slight nuance is that the first idle instance is not initialized until the
 * first concurrent request comes in. This is because many use-cases won't
 * involve parallel requests and, for those, we can avoid eagerly spinning up a
 * second PHP instance.
 *
 * This strategy is inspired by Cowboy, an Erlang HTTP server. Handling a
 * single extra request can happen immediately, while handling multiple extra
 * requests requires extra time to spin up a few PHP instances. This is a more
 * resource-friendly tradeoff than keeping 5 idle instances at all times.
 */
export declare class PHPProcessManager implements AsyncDisposable {
    private primaryPhp?;
    private primaryIdle;
    private nextInstance;
    /**
     * All spawned PHP instances, including the primary PHP instance.
     * Used for bookkeeping and reaping all instances on dispose.
     */
    private allInstances;
    private phpFactory?;
    private maxPhpInstances;
    private semaphore;
    constructor(options?: ProcessManagerOptions);
    /**
     * Get the primary PHP instance.
     *
     * If the primary PHP instance is not set, it will be spawned
     * using the provided phpFactory.
     *
     * @throws {Error} when called twice before the first call is resolved.
     */
    getPrimaryPhp(): Promise<PHP>;
    /**
     * Get a PHP instance.
     *
     * It could be either the primary PHP instance, an idle disposable PHP
     * instance, or a newly spawned PHP instance – depending on the resource
     * availability.
     *
     * @throws {MaxPhpInstancesError} when the maximum number of PHP instances is reached
     *                                and the waiting timeout is exceeded.
     */
    acquirePHPInstance(): Promise<SpawnedPHP>;
    /**
     * Initiated spawning of a new PHP instance.
     * This function is synchronous on purpose – it needs to synchronously
     * add the spawn promise to the allInstances array without waiting
     * for PHP to spawn.
     */
    private spawn;
    /**
     * Actually acquires the lock and spawns a new PHP instance.
     */
    private doSpawn;
    [Symbol.asyncDispose](): Promise<void>;
}
