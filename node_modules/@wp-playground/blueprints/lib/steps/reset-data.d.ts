import type { StepHandler } from '.';
/**
 * @inheritDoc resetData
 * @example
 *
 * <code>
 * {
 * 		"step": "resetData"
 * }
 * </code>
 */
export interface ResetDataStep {
    step: 'resetData';
}
/**
 * Deletes WordPress posts and comments and sets the auto increment sequence
 * for the posts and comments tables to 0.
 *
 * @param playground Playground client.
 */
export declare const resetData: StepHandler<ResetDataStep>;
