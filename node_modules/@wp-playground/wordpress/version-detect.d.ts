import type { PHPRequestHandler } from '@php-wasm/universal';
export declare function getLoadedWordPressVersion(requestHandler: PHPRequestHandler): Promise<string>;
/**
 * Returns a WordPress build version string, for a given WordPress version string.
 *
 * You can find the full list of supported build version strings in
 * packages/playground/wordpress-builds/src/wordpress/wp-versions.json
 *
 * Each released version will be converted to the major.minor format.
 * For example 6.6.1 will be converted to 6.6.
 *
 * Release candidates (RC) and beta releases are converted to "beta".
 *
 * Nightly releases are converted to "nightly".
 *
 * @param wpVersionString - A WordPress version string.
 * @returns A Playground WordPress build version.
 */
export declare function versionStringToLoadedWordPressVersion(wpVersionString: string): string;
