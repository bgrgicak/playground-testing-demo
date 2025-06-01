import { StepHandler } from '.';
/**
 * @inheritDoc importThemeStarterContent
 * @example
 *
 * <code>
 * {
 * 		"step": "importThemeStarterContent"
 * }
 * </code>
 */
export interface ImportThemeStarterContentStep {
    /** The step identifier. */
    step: 'importThemeStarterContent';
    /**
     * The name of the theme to import content from.
     */
    themeSlug?: string;
}
/**
 * Imports a theme Starter Content into WordPress.
 *
 * @param playground Playground client.
 */
export declare const importThemeStarterContent: StepHandler<ImportThemeStarterContentStep>;
