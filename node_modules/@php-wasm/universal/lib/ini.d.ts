import type { UniversalPHP } from './universal-php';
/**
 * Reads the php.ini file and returns its entries.
 *
 * @param php The PHP instance.
 * @param entries Optional. If provided, only the specified entries will be returned.
 * @returns The php.ini entries.
 */
export declare function getPhpIniEntries(php: UniversalPHP, entries?: string[]): Promise<{
    [key: string]: any;
}>;
/**
 * Rewrites the php.ini file with the given entries.
 *
 * @param php The PHP instance.
 * @param entries The entries to write to the php.ini file.
 */
export declare function setPhpIniEntries(php: UniversalPHP, entries: Record<string, unknown>): Promise<void>;
/**
 * Sets php.ini values to the given values, executes a callback,
 * and restores the original php.ini values. This is useful for
 * running code with temporary php.ini values, such as when
 * disabling network-related PHP functions just to run WordPress
 * installer.
 *
 * @example
 * ```ts
 *	await withPHPIniValues(
 *		php,
 *		{
 *			disable_functions: 'fsockopen',
 *			allow_url_fopen: '0',
 *		},
 *		async () => await runWpInstallationWizard(php, {
 *			options: {},
 *		})
 *	);
 *	```
 *
 * @param php The PHP instance.
 * @param phpIniValues The php.ini values to set.
 * @param callback The callback to execute.
 * @returns The result of the callback.
 */
export declare function withPHPIniValues(php: UniversalPHP, phpIniValues: Record<string, string>, callback: () => Promise<any>): Promise<any>;
