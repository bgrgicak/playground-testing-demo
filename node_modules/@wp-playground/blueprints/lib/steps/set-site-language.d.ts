import type { StepHandler } from '.';
/**
 * @inheritDoc setSiteLanguage
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 * 		"step": "setSiteLanguage",
 * 		"language": "en_US"
 * }
 * </code>
 */
export interface SetSiteLanguageStep {
    step: 'setSiteLanguage';
    /** The language to set, e.g. 'en_US' */
    language: string;
}
/**
 * Get the translation package URL for a given WordPress version and language.
 * The translation package URL is fetched from the WordPress.org API based on
 * the provided WordPress version.
 *
 * If the translation package is not found, an error is thrown.
 */
export declare const getWordPressTranslationUrl: (wpVersion: string, language: string) => Promise<string>;
/**
 * Sets the site language and download translations.
 */
export declare const setSiteLanguage: StepHandler<SetSiteLanguageStep>;
