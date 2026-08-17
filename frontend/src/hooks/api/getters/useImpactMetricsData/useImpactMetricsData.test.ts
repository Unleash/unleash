import { expect, test } from 'vitest';
import { rangeToRefreshInterval } from './useImpactMetricsData.js';

test('polls hourly ranges every 30s and stretches wider ranges to a 10-minute cap', () => {
    expect(rangeToRefreshInterval('hour')).toBe(30_000);
    expect(rangeToRefreshInterval('day')).toBe(2 * 60_000);
    expect(rangeToRefreshInterval('week')).toBe(5 * 60_000);
    expect(rangeToRefreshInterval('month')).toBe(10 * 60_000);
    expect(rangeToRefreshInterval('threeMonths')).toBe(10 * 60_000);
    expect(rangeToRefreshInterval('sixMonths')).toBe(10 * 60_000);
});
