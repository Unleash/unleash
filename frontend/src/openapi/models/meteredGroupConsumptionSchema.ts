/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */
import type { ConsumptionDataPointSchema } from './consumptionDataPointSchema.js';

export interface MeteredGroupConsumptionSchema {
    /** Array of consumption data points */
    dataPoints: ConsumptionDataPointSchema[];
    /** Name of the metered group */
    meteredGroup: string;
}
