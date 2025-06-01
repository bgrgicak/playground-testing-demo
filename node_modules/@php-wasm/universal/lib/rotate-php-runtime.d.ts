import { PHP } from './php';
export interface RotateOptions {
    php: PHP;
    cwd: string;
    recreateRuntime: () => Promise<number> | number;
    maxRequests: number;
}
/**
 * Listens to PHP events and swaps the internal PHP Runtime for a fresh one
 * after a certain number of run() calls (which are responsible for handling
 * HTTP requests).
 *
 * Why? Because PHP and PHP extension have a memory leak. Each request leaves
 * the memory a bit more fragmented and with a bit less available space than
 * before. Eventually, new allocations start failing.
 *
 * Rotating the PHP instance may seem like a workaround, but it's actually
 * what PHP-FPM does natively:
 *
 * https://www.php.net/manual/en/install.fpm.configuration.php#pm.max-tasks
 *
 * @return cleanup function to restore
 */
export declare function rotatePHPRuntime({ php, cwd, recreateRuntime, maxRequests, }: RotateOptions): () => void;
