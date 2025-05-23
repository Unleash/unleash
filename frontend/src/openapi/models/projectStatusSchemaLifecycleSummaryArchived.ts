/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * Information on archived flags in this project.
 */
export type ProjectStatusSchemaLifecycleSummaryArchived = {
    /** The number of archived feature flags in this project. If a flag is deleted permanently, it will no longer be counted as part of this statistic. */
    currentFlags: number;
    /** The number of flags in this project that have been changed over the last 30 days. */
    last30Days: number;
};
