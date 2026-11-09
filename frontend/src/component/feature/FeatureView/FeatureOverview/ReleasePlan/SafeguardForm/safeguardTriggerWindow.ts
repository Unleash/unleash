import type { MetricQuerySchemaTimeRange } from 'openapi/models/metricQuerySchemaTimeRange';

// A safeguard stores its impact metric's range but triggers on one step of that range.
// The backend derives the step from the range.
export const safeguardTriggerWindowLabels: Record<
    MetricQuerySchemaTimeRange,
    string
> = {
    hour: 'Last minute',
    day: 'Last 15 minutes',
    week: 'Last 3 hours',
    month: 'Last day',
};
