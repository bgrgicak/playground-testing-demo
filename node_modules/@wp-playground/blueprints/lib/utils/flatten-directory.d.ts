import type { UniversalPHP } from '@php-wasm/universal';
/**
 * Flattens a directory.
 * If the directory contains only one file, it will be moved to the parent
 * directory. Otherwise, the directory will be renamed to the default name.
 *
 * @param php Playground client.
 * @param directoryPath The directory to flatten.
 * @param defaultName The name to use if the directory contains only one file.
 * @returns The final path of the directory.
 */
export declare function flattenDirectory(php: UniversalPHP, directoryPath: string, defaultName: string): Promise<string>;
