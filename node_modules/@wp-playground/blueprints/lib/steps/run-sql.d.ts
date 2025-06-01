import { StepHandler } from '.';
/**
 * @inheritDoc runSql
 * @hasRunnableExample
 * @example
 *
 * <code>
 * {
 *		"step": "runSql",
 *		"sql": {
 *			"resource": "literal",
 *			"name": "schema.sql",
 *			"contents": "DELETE FROM wp_posts"
 *		}
 * }
 * </code>
 */
export interface RunSqlStep<ResourceType> {
    /**
     * The step identifier.
     */
    step: 'runSql';
    /**
     * The SQL to run. Each non-empty line must contain a valid SQL query.
     */
    sql: ResourceType;
}
/**
 * Run one or more SQL queries.
 *
 * This step will treat each non-empty line in the input SQL as a query and
 * try to execute it using `$wpdb`. Queries spanning multiple lines are not
 * yet supported.
 */
export declare const runSql: StepHandler<RunSqlStep<File>>;
