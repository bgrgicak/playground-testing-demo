/**
 * Spawns a new Worker Thread.
 *
 * @param  workerUrl The absolute URL of the worker script.
 * @returns The spawned Worker Thread.
 */
export declare function spawnPHPWorkerThread(workerUrl: string): Promise<Worker>;
