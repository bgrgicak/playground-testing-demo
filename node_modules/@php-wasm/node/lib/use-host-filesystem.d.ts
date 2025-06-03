import type { PHP } from '@php-wasm/universal';
/**
 * Enables host filesystem usage by mounting root
 * directories (e.g. /, /home, /var) into the in-memory
 * virtual filesystem used by this PHP instance, and
 * setting the current working directory to one used by
 * the current node.js process.
 */
export declare function useHostFilesystem(php: PHP): void;
