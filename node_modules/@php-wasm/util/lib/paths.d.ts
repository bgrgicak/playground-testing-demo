/**
 * The functions in this module are mostly copied from the generated
 * Emscripten PHP module. This enables features like filesystem journaling,
 * which use some low-level Emscripten APIs and need access to the
 * same path helpers.
 */
/**
 * Joins paths together.
 *
 * For example:
 *
 * > joinPaths('wordpress', 'wp-content')
 * 'wordpress/wp-content'
 *
 * Use this for all PHP paths and **do not** use path.join().
 * This is important because Emscripten paths are **always**
 * POSIX-style paths. Imagine joining paths on Windows:
 *
 * > path.join('wordpress', 'wp-content')
 * '\\wordpress\\wp-content'  // invalid in PHP.wasm
 *
 * See the path.join issue for more details:
 *
 * https://github.com/WordPress/playground-tools/issues/11#issuecomment-1579074763
 *
 * @param paths Paths segments to join
 * @returns A joined path
 */
export declare function joinPaths(...paths: string[]): string;
/**
 * Returns the directory name of a path.
 *
 * @param path
 * @returns
 */
export declare function dirname(path: string): string;
/**
 * Returns the last portion of a path.
 *
 * @param path - The path to extract the basename from.
 * @returns The basename of the path.
 */
export declare function basename(path: string): string;
/**
 * Normalizes a path.
 *
 * For example:
 *
 * > normalizePath('wordpress/wp-content/../')
 * 'wordpress'
 *
 * @param path
 * @returns
 */
export declare function normalizePath(path: string): string;
/**
 * Normalizes paths.
 *
 * For example:
 *
 * > normalizePathsArray(['wordpress', 'wp-content', '..', '', '.',
 * 'wp-includes']) ['wordpress', 'wp-includes']
 *
 * @param parts parts of the path to normalize
 * @param allowAboveRoot allow paths above the root
 * @returns normalized paths
 */
export declare function normalizePathsArray(parts: string[], allowAboveRoot: boolean): string[];
/**
 * Checks if the given parent path is an ancestor of the given child path.
 *
 * @param parent The parent path to check.
 * @param child The child path to verify against the parent.
 * @returns Whether the `parent` path is an ancestor of the `child` path.
 */
export declare function isParentOf(parent: string, child: string): boolean;
