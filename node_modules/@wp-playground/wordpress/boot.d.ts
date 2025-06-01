import { FileNotFoundAction, FileNotFoundGetActionCallback, FileTree, PHP, PHPProcessManager, PHPRequestHandler, SpawnHandler } from '@php-wasm/universal';
export type PhpIniOptions = Record<string, string>;
export type Hook = (php: PHP) => void | Promise<void>;
export interface Hooks {
    beforeWordPressFiles?: Hook;
    beforeDatabaseSetup?: Hook;
}
export type DatabaseType = 'sqlite' | 'mysql' | 'custom';
export interface BootOptions {
    createPhpRuntime: () => Promise<number>;
    /**
     * Mounting and Copying is handled via hooks for starters.
     *
     * In the future we could standardize the
     * browser-specific and node-specific mounts
     * in the future.
     */
    hooks?: Hooks;
    /**
     * PHP SAPI name to be returned by get_sapi_name(). Overriding
     * it is useful for running programs that check for this value,
     * e.g. WP-CLI
     */
    sapiName?: string;
    /**
     * URL to use as the site URL. This is used to set the WP_HOME
     * and WP_SITEURL constants in WordPress.
     */
    siteUrl: string;
    documentRoot?: string;
    /** SQL file to load instead of installing WordPress. */
    dataSqlPath?: string;
    /** Zip with the WordPress installation to extract in /wordpress. */
    wordPressZip?: File | Promise<File> | undefined;
    /** Preloaded SQLite integration plugin. */
    sqliteIntegrationPluginZip?: File | Promise<File>;
    spawnHandler?: (processManager: PHPProcessManager) => SpawnHandler;
    /**
     * PHP.ini entries to define before running any code. They'll
     * be used for all requests.
     */
    phpIniEntries?: PhpIniOptions;
    /**
     * PHP constants to define for every request.
     */
    constants?: Record<string, string | number | boolean | null>;
    /**
     * Files to create in the filesystem before any mounts are applied.
     *
     * Example:
     *
     * ```ts
     * {
     * 		createFiles: {
     * 			'/tmp/hello.txt': 'Hello, World!',
     * 			'/internal/preload': {
     * 				'1-custom-mu-plugin.php': '<?php echo "Hello, World!";',
     * 			}
     * 		}
     * }
     * ```
     */
    createFiles?: FileTree;
    /**
     * A callback that decides how to handle a file-not-found condition for a
     * given request URI.
     */
    getFileNotFoundAction?: FileNotFoundGetActionCallback;
}
/**
 * Boots a WordPress instance with the given options.
 *
 * High-level overview:
 *
 * * Boot PHP instances and PHPRequestHandler
 * * Setup VFS, run beforeWordPressFiles hook
 * * Setup WordPress files (if wordPressZip is provided)
 * * Run beforeDatabaseSetup hook
 * * Setup the database – SQLite, MySQL (@TODO), or rely on a mounted database
 * * Run WordPress installer, if the site isn't installed yet
 *
 * @param options Boot configuration options
 * @return PHPRequestHandler instance with WordPress installed.
 */
export declare function bootWordPress(options: BootOptions): Promise<PHPRequestHandler>;
export declare function getFileNotFoundActionForWordPress(relativeUri: string): FileNotFoundAction;
