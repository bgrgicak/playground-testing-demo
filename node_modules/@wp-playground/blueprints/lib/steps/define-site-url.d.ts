import type { StepHandler } from '.';
/**
 * Changes the site URL of the WordPress installation.
 *
 * @inheritDoc defineSiteUrl
 */
export interface DefineSiteUrlStep {
    step: 'defineSiteUrl';
    /** The URL */
    siteUrl: string;
}
/**
 * Sets [`WP_HOME`](https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#blog-address-url) and [`WP_SITEURL`](https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#wp-siteurl) constants for the WordPress installation.
 *
 * Using this step on playground.wordpress.net is moot.
 * It is useful when building a custom Playground-based tool, like [`wp-now`](https://www.npmjs.com/package/@wp-now/wp-now),
 * or deploying Playground on a custom domain.
 *
 * @param playground The playground client.
 * @param siteUrl
 */
export declare const defineSiteUrl: StepHandler<DefineSiteUrlStep>;
