/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { MeteredGroupConsumptionSchema } from './meteredGroupConsumptionSchema.js';

export interface ConnectionConsumptionSchema {
    /** Feature consumption data points */
    features: MeteredGroupConsumptionSchema[];
    /** Metrics consumption data points */
    metrics: MeteredGroupConsumptionSchema[];
}
