/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * Health summary of the project
 */
export type ProjectInsightsSchemaHealth = {
    /** The number of active feature toggles. */
    activeCount: number;
    /** The number of potentially stale feature toggles. */
    potentiallyStaleCount: number;
    /** An indicator of the [project's health](https://docs.getunleash.io/reference/technical-debt#health-rating) on a scale from 0 to 100 */
    rating: number;
    /** The number of stale feature toggles. */
    staleCount: number;
};
