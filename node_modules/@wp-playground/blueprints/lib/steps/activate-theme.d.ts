import type { StepHandler } from '.';
/**
 * @inheritDoc activateTheme
 * @example
 *
 * <code>
 * {
 * 		"step": "activateTheme",
 * 		"themeFolderName": "storefront"
 * }
 * </code>
 */
export interface ActivateThemeStep {
    step: 'activateTheme';
    /**
     * The name of the theme folder inside wp-content/themes/
     */
    themeFolderName: string;
}
/**
 * Activates a WordPress theme (if it's installed).
 *
 * @param playground The playground client.
 * @param themeFolderName The theme folder name.
 */
export declare const activateTheme: StepHandler<ActivateThemeStep>;
