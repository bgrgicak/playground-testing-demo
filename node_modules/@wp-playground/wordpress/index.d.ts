import { PHP, UniversalPHP } from '@php-wasm/universal';
export { bootWordPress, getFileNotFoundActionForWordPress } from './boot';
export { getLoadedWordPressVersion } from './version-detect';
export * from './version-detect';
export * from './rewrite-rules';
/**
 * Preloads the platform mu-plugins from /internal/shared/mu-plugins.
 * This avoids polluting the WordPress installation with mu-plugins
 * that are only needed in the Playground environment.
 *
 * @param php
 */
export declare function setupPlatformLevelMuPlugins(php: UniversalPHP): Promise<void>;
/**
 * Runs phpinfo() when the requested path is /phpinfo.php.
 */
export declare function preloadPhpInfoRoute(php: UniversalPHP, requestPath?: string): Promise<void>;
export declare function preloadSqliteIntegration(php: UniversalPHP, sqliteZip: File): Promise<void>;
/**
 * Prepare the WordPress document root given a WordPress zip file and
 * the sqlite-database-integration zip file.
 *
 * This is a TypeScript function for now, just to get something off the
 * ground, but it may be superseded by the PHP Blueprints library developed
 * at https://github.com/WordPress/blueprints-library/
 *
 * That PHP library will come with a set of functions and a CLI tool to
 * turn a Blueprint into a WordPress directory structure or a zip Snapshot.
 * Let's **not** invest in the TypeScript implementation of this function,
 * accept the limitation, and switch to the PHP implementation as soon
 * as that's viable.
 */
export declare function unzipWordPress(php: PHP, wpZip: File): Promise<void>;
/**
 * Resolves a specific WordPress release URL and version string based on
 * a version query string such as "latest", "beta", or "6.6".
 *
 * Examples:
 * ```js
 * const { releaseUrl, version } = await resolveWordPressRelease('latest')
 * // becomes https://wordpress.org/wordpress-6.6.2.zip and '6.6.2'
 *
 * const { releaseUrl, version } = await resolveWordPressRelease('beta')
 * // becomes https://wordpress.org/wordpress-6.6.2-RC1.zip and '6.6.2-RC1'
 *
 * const { releaseUrl, version } = await resolveWordPressRelease('6.6')
 * // becomes https://wordpress.org/wordpress-6.6.2.zip and '6.6.2'
 * ```
 *
 * @param versionQuery - The WordPress version query string to resolve.
 * @returns The resolved WordPress release URL and version string.
 */
export declare function resolveWordPressRelease(versionQuery?: string): Promise<{
    releaseUrl: any;
    version: any;
    source: string;
}>;
