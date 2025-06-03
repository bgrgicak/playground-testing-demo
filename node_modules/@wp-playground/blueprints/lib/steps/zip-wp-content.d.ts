import type { UniversalPHP } from '@php-wasm/universal';
interface ZipWpContentOptions {
    /**
     * @private
     * A temporary workaround to enable including the WordPress default theme
     * in the exported zip file.
     */
    selfContained?: boolean;
}
/**
 * Replace the current wp-content directory with one from the provided zip file.
 *
 * @param playground Playground client.
 * @param wpContentZip Zipped WordPress site.
 */
export declare const zipWpContent: (playground: UniversalPHP, { selfContained }?: ZipWpContentOptions) => Promise<Uint8Array>;
export {};
