import type { UniversalPHP } from '@php-wasm/universal';
/**
 * Exports the WordPress database as a WXR file using
 * the core WordPress export tool.
 *
 * @param playground Playground client
 * @returns WXR file
 */
export declare function exportWXR(playground: UniversalPHP): Promise<File>;
