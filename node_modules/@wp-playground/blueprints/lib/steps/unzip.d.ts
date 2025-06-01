import { StepHandler } from '.';
/**
 * @inheritDoc unzip
 * @example
 *
 * <code>
 * {
 * 		"step": "unzip",
 * 		"zipFile": {
 * 			"resource": "vfs",
 * 			"path": "/wordpress/data.zip"
 * 		},
 * 		"extractToPath": "/wordpress"
 * }
 * </code>
 */
export interface UnzipStep<ResourceType> {
    step: 'unzip';
    /** The zip file to extract */
    zipFile?: ResourceType;
    /**
     * The path of the zip file to extract
     * @deprecated Use zipFile instead.
     */
    zipPath?: string;
    /** The path to extract the zip file to */
    extractToPath: string;
}
/**
 * Unzip a zip file.
 *
 * @param playground Playground client.
 * @param zipPath The zip file to unzip.
 * @param extractTo The directory to extract the zip file to.
 */
export declare const unzip: StepHandler<UnzipStep<File>>;
