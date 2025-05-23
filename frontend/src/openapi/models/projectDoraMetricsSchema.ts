/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { DoraFeaturesSchema } from './doraFeaturesSchema.js';

/**
 * A projects dora metrics
 */
export interface ProjectDoraMetricsSchema {
    /** An array of objects containing feature flag name and timeToProduction values. The measurement unit of timeToProduction is days. */
    features: DoraFeaturesSchema[];
    /** The average time it takes a feature flag to be enabled in production. The measurement unit is days. */
    projectAverage?: number;
}
