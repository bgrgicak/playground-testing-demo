import { StepHandler } from '.';
/**
 * @inheritDoc rm
 * @hasRunnableExample
 * @landingPage /index.php
 * @example
 *
 * <code>
 * {
 * 		"step": "rm",
 * 		"path": "/wordpress/index.php"
 * }
 * </code>
 */
export interface RmStep {
    step: 'rm';
    /** The path to remove */
    path: string;
}
/**
 * Removes a file at the specified path.
 */
export declare const rm: StepHandler<RmStep>;
