/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { InstanceInsightsSchemaCreationArchiveTrendsItemCreatedFlags } from './instanceInsightsSchemaCreationArchiveTrendsItemCreatedFlags.js';

export type InstanceInsightsSchemaCreationArchiveTrendsItem = {
    /**
     * Total count of archived flags during this week
     * @minimum 0
     */
    archivedFlags: number;
    /** Count of newly created flags by flag type */
    createdFlags: InstanceInsightsSchemaCreationArchiveTrendsItemCreatedFlags;
    /** A UTC date when the stats were captured. Time is the very end of a given week. */
    date: string;
    /** Project id that the flags belong to */
    project: string;
    /** Year and week in a given year for which the stats were calculated */
    week: string;
};
