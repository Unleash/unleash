/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { UpdateFeatureSchemaType } from './updateFeatureSchemaType.js';

/**
 * Data used for updating a feature flag
 */
export interface UpdateFeatureSchema {
    /** If `true` the feature flag will be moved to the [archive](https://docs.getunleash.io/reference/feature-toggles#archive-a-feature-flag) with a property `archivedAt` set to current time */
    archived?: boolean;
    /** Detailed description of the feature */
    description?: string;
    /** `true` if the impression data collection is enabled for the feature */
    impressionData?: boolean;
    /** `true` if the feature is archived */
    stale?: boolean;
    /** Type of the flag e.g. experiment, kill-switch, release, operational, permission */
    type?: UpdateFeatureSchemaType;
}
