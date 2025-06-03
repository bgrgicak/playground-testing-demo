import type { StepHandler } from '.';
/**
 * @private
 */
export interface RunWpInstallationWizardStep {
    step: 'runWpInstallationWizard';
    options: WordPressInstallationOptions;
}
export interface WordPressInstallationOptions {
    adminUsername?: string;
    adminPassword?: string;
}
/**
 * Installs WordPress
 *
 * @param playground The playground client.
 * @param options Installation options.
 */
export declare const runWpInstallationWizard: StepHandler<RunWpInstallationWizardStep>;
