import { StepHandler } from '.';
/**
 * @inheritDoc activatePlugin
 * @example
 *
 * <code>
 * {
 * 		"step": "activatePlugin",
 * 		"pluginName": "Gutenberg",
 * 		"pluginPath": "/wordpress/wp-content/plugins/gutenberg"
 * }
 * </code>
 */
export interface ActivatePluginStep {
    step: 'activatePlugin';
    /**
     * Path to the plugin directory as absolute path
     * (/wordpress/wp-content/plugins/plugin-name); or the plugin entry file
     * relative to the plugins directory (plugin-name/plugin-name.php).
     */
    pluginPath: string;
    /** Optional. Plugin name to display in the progress bar. */
    pluginName?: string;
}
/**
 * Activates a WordPress plugin (if it's installed).
 *
 * @param playground The playground client.
 */
export declare const activatePlugin: StepHandler<ActivatePluginStep>;
