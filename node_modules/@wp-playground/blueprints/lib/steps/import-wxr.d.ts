import { StepHandler } from '.';
/**
 * @inheritDoc importWxr
 * @example
 *
 * <code>
 * {
 * 		"step": "importWxr",
 * 		"file": {
 * 			"resource": "url",
 * 			"url": "https://your-site.com/starter-content.wxr"
 * 		}
 * }
 * </code>
 */
export interface ImportWxrStep<ResourceType> {
    step: 'importWxr';
    /** The file to import */
    file: ResourceType;
    /**
     * The importer to use. Possible values:
     *
     * - `default`: The importer from https://github.com/humanmade/WordPress-Importer
     * - `data-liberation`: The experimental Data Liberation WXR importer developed at
     *                      https://github.com/WordPress/wordpress-playground/issues/1894
     *
     * This option is deprecated. The syntax will not be removed, but once the
     * Data Liberation importer matures, it will become the only supported
     * importer and the `importer` option will be ignored.
     *
     * @deprecated
     */
    importer?: 'data-liberation' | 'default';
}
/**
 * Imports a WXR file into WordPress.
 *
 * @param playground Playground client.
 * @param file The file to import.
 */
export declare const importWxr: StepHandler<ImportWxrStep<File>>;
