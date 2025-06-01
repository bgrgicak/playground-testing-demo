import { StepHandler } from '.';
/**
 * @inheritDoc importWordPressFiles
 * @example
 *
 * <code>
 * {
 * 		"step": "importWordPressFiles",
 * 		"wordPressFilesZip": {
 * 			"resource": "url",
 * 			"url": "https://mysite.com/import.zip"
 *  	}
 * }
 * </code>
 */
export interface ImportWordPressFilesStep<ResourceType> {
    step: 'importWordPressFiles';
    /**
     * The zip file containing the top-level WordPress files and
     * directories.
     */
    wordPressFilesZip: ResourceType;
    /**
     * The path inside the zip file where the WordPress files are.
     */
    pathInZip?: string;
}
/**
 * Imports top-level WordPress files from a given zip file into
 * the `documentRoot`. For example, if a zip file contains the
 * `wp-content` and `wp-includes` directories, they will replace
 * the corresponding directories in Playground's `documentRoot`.
 *
 * Any files that Playground recognizes as "excluded from the export"
 * will carry over from the existing document root into the imported
 * directories. For example, the sqlite-database-integration plugin.
 *
 * @param playground Playground client.
 * @param wordPressFilesZip Zipped WordPress site.
 */
export declare const importWordPressFiles: StepHandler<ImportWordPressFilesStep<File>>;
