import type { StepHandler } from '.';
/**
 * @inheritDoc writeFile
 * @hasRunnableExample
 * @landingPage /test.php
 * @example
 *
 * <code>
 * {
 * 		"step": "writeFile",
 * 		"path": "/wordpress/test.php",
 * 		"data": "<?php echo 'Hello World!'; ?>"
 * }
 * </code>
 */
export interface WriteFileStep<FileResource> {
    step: 'writeFile';
    /** The path of the file to write to */
    path: string;
    /** The data to write */
    data: FileResource | string | Uint8Array;
}
/**
 * Writes data to a file at the specified path.
 */
export declare const writeFile: StepHandler<WriteFileStep<File>>;
