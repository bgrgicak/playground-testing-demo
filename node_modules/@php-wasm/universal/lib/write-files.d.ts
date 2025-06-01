import { UniversalPHP } from './universal-php';
export interface WriteFilesOptions {
    /**
     * Whether to wipe out the contents of the
     * root directory before writing the new files.
     */
    rmRoot?: boolean;
}
export interface FileTree extends Record<string, Uint8Array | string | FileTree> {
}
/**
 * Writes multiple files to a specified directory in the Playground
 * filesystem.
 *
 * @example ```ts
 * await writeFiles(php, '/test', {
 * 	'file.txt': 'file',
 * 	'sub/file.txt': 'file',
 * 	'sub1/sub2/file.txt': 'file',
 * });
 * ```
 *
 * @param php
 * @param root
 * @param newFiles
 * @param options
 */
export declare function writeFiles(php: UniversalPHP, root: string, newFiles: FileTree, { rmRoot }?: WriteFilesOptions): Promise<void>;
