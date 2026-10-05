import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import type { ISafeguard } from 'interfaces/safeguard';
import type { MetricQuerySchemaTimeRange } from 'openapi/models/metricQuerySchemaTimeRange';
import { ReadonlySafeguardDisplay } from './ReadonlySafeguardDisplay.tsx';

const safeguardWithRange = (
    timeRange: MetricQuerySchemaTimeRange,
): ISafeguard => ({
    id: 'safeguard-1',
    action: { id: 'action-1', type: 'pause' },
    impactMetric: {
        id: 'metric-1',
        metricName: 'unleash_counter_http_requests_total',
        timeRange,
        aggregationMode: 'count',
        labelSelectors: {},
    },
    triggerCondition: { operator: '>', threshold: 300 },
});

test('shows the window a safeguard triggers on rather than the range of its metric', () => {
    render(<ReadonlySafeguardDisplay safeguard={safeguardWithRange('week')} />);

    expect(screen.getByText('Last 3 hours')).toBeInTheDocument();
});
