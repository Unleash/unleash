/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { TagSchema } from './tagSchema.js';
import type { CreateFeatureSchemaType } from './createFeatureSchemaType.js';

/**
 * Data used to create a new feature flag.
 */
export interface CreateFeatureSchema {
    /**
     * Detailed description of the feature
     * @nullable
     */
    description?: string | null;
    /** `true` if the impression data collection is enabled for the feature, otherwise `false`. */
    impressionData?: boolean;
    /** Unique feature name */
    name: string;
    /** Tags to add to the feature. */
    tags?: TagSchema[];
    /** The feature flag's [type](https://docs.getunleash.io/reference/feature-toggles#feature-flag-types). One of experiment, kill-switch, release, operational, or permission */
    type?: CreateFeatureSchemaType;
}
