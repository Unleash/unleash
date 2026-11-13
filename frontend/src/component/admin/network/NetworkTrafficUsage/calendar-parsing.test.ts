import { afterEach, describe, expect, test, vi } from 'vitest';
import type { TrafficUsageDataSegmentedCombinedSchema } from 'openapi';

afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.resetModules();
});

describe.each([
    'America/New_York',
    'UTC',
    'Asia/Kolkata',
])('traffic calendar values in %s', (timezone) => {
    test('averages completed months without including current traffic', async () => {
        vi.stubEnv('TZ', timezone);
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-15T12:00:00Z'));
        vi.resetModules();
        const { averageTrafficPreviousMonths } = await import(
            './average-traffic-previous-months.js'
        );
        const traffic: TrafficUsageDataSegmentedCombinedSchema = {
            grouping: 'monthly',
            dateRange: { from: '2026-08-01', to: '2026-11-30' },
            apiData: [
                {
                    apiPath: '/api/client',
                    dataPoints: [
                        '2026-08',
                        '2026-09',
                        '2026-10',
                        '2026-11',
                    ].map((period) => ({
                        period,
                        trafficTypes: [
                            {
                                group: 'successful-requests',
                                count: period === '2026-11' ? 9999 : 100,
                            },
                        ],
                    })),
                },
            ],
        };
        expect(averageTrafficPreviousMonths(traffic)).toBe(100);
        expect(averageTrafficPreviousMonths({ ...traffic, apiData: [] })).toBe(
            0,
        );
        expect(
            averageTrafficPreviousMonths({ ...traffic, grouping: 'daily' }),
        ).toBe(0);
    });

    test.each([
        ['2026-06', 'June 2026'],
        ['2026-01', 'January 2026'],
        ['2024-02', 'February 2024'],
    ])('labels calendar month %s without moving to the previous month', async (month, label) => {
        vi.stubEnv('TZ', timezone);
        const { getChartLabel } = await import('./chart-functions.js');
        expect(getChartLabel({ grouping: 'daily', month })).toContain(
            `for ${label}.`,
        );
    });

    test('keeps the monthly overview label unchanged', async () => {
        vi.stubEnv('TZ', timezone);
        const { getChartLabel } = await import('./chart-functions.js');
        expect(getChartLabel({ grouping: 'monthly', monthsBack: 3 })).toContain(
            'current month and the preceding 3 months.',
        );
    });
});
