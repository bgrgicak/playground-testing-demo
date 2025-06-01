import { PHP } from './php';
/**
 * Proxy specific paths to the parent's MEMFS instance.
 * This is useful for sharing the WordPress installation
 * between the parent and child processes.
 */
export declare function proxyFileSystem(sourceOfTruth: PHP, replica: PHP, paths: string[]): void;
