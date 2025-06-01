import { StepHandler } from '.';
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
 * Infers the translation package URL for a given WordPress version.
 *
 * If it cannot be inferred, the latest translation package will be used instead.
 */
export declare const getWordPressTranslationUrl: (wpVersion: string, language: string, latestBetaWordPressVersion?: string, latestStableWordPressVersion?: string) => Promise<string>;
/**
 * Sets the site language and download translations.
 */
export declare const setSiteLanguage: StepHandler<SetSiteLanguageStep>;
