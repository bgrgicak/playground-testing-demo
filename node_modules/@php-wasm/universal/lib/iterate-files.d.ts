import { UniversalPHP } from './universal-php';
export type IteratePhpFilesOptions = {
    /**
     * Should yield paths relative to the root directory?
     * If false, all paths will be absolute.
     */
    relativePaths?: boolean;
    /**
     * A prefix to add to all paths.
     * Only used if `relativePaths` is true.
     */
    pathPrefix?: string;
    /**
     * A list of paths to exclude from the results.
     */
    exceptPaths?: string[];
};
/**
 * Iterates over all files in a php directory and its subdirectories.
 *
 * @param php - The PHP instance.
 * @param root - The root directory to start iterating from.
 * @param options - Optional configuration.
 * @returns All files found in the tree.
 */
export declare function iteratePhpFiles(php: UniversalPHP, root: string, { relativePaths, pathPrefix, exceptPaths, }?: IteratePhpFilesOptions): AsyncGenerator<File>;
