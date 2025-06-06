/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { FeatureLinkSchema } from './featureLinkSchema.js';

/**
 * A list of links for a feature
 */
export interface FeatureLinksSchema {
    /** The name of the child feature. */
    feature: string;
    /** List of feature links */
    links: FeatureLinkSchema[];
}
