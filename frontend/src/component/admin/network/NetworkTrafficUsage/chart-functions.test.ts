import type { TrafficUsageDataSegmentedCombinedSchema } from 'openapi';
import { toTrafficUsageChartData } from './chart-functions';
import { endpointsInfo } from './endpoint-info';

describe('toChartData', () => {
    const dataPoint = (period: string, count: number) => ({
        period,
        trafficTypes: [{ count, group: 'successful-requests' }],
    });

    const fromEndpointInfo = (endpoint: keyof typeof endpointsInfo) => {
        const info = endpointsInfo[endpoint];
        return {
            backgroundColor: info.color,
            hoverBackgroundColor: info.color,
            label: info.label,
        };
    };

    test('monthly data conversion', () => {
        const input: TrafficUsageDataSegmentedCombinedSchema = {
            grouping: 'monthly',
            dateRange: {
                from: '2025-01-01',
                to: '2025-06-30',
            },
            apiData: [
                {
                    apiPath: '/api/admin',
                    dataPoints: [
                        dataPoint('2025-06', 5),
                        dataPoint('2025-05', 4),
                        dataPoint('2025-02', 6),
                        dataPoint('2025-04', 2),
                    ],
                },
                {
                    apiPath: '/api/client',
                    dataPoints: [
                        dataPoint('2025-06', 10),
                        dataPoint('2025-01', 7),
                        dataPoint('2025-03', 11),
                        dataPoint('2025-04', 13),
                    ],
                },
            ],
        };

        const expectedOutput = {
            datasets: [
                {
                    data: [0, 6, 0, 2, 4, 5],
                    ...fromEndpointInfo('/api/admin'),
                },
                {
                    data: [7, 0, 11, 13, 0, 10],
                    ...fromEndpointInfo('/api/client'),
                },
            ],
            labels: [
                '2025-01',
                '2025-02',
                '2025-03',
                '2025-04',
                '2025-05',
                'Current month',
            ],
        };

        expect(toTrafficUsageChartData(input)).toMatchObject(expectedOutput);
    });

    test('daily data conversion', () => {
        const input: TrafficUsageDataSegmentedCombinedSchema = {
            grouping: 'daily',
            dateRange: {
                from: '2025-01-01',
                to: '2025-01-31',
            },
            apiData: [
                {
                    apiPath: '/api/admin',
                    dataPoints: [
                        dataPoint('2025-01-01', 5),
                        dataPoint('2025-01-15', 4),
                        dataPoint('2025-01-14', 6),
                        dataPoint('2025-01-06', 2),
                    ],
                },
                {
                    apiPath: '/api/client',
                    dataPoints: [
                        dataPoint('2025-01-02', 2),
                        dataPoint('2025-01-17', 6),
                        dataPoint('2025-01-19', 4),
                        dataPoint('2025-01-06', 8),
                    ],
                },
            ],
        };

        const expectedOutput = {
            datasets: [
                {
                    data: [
                        5, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 6, 4, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    ],
                    ...fromEndpointInfo('/api/admin'),
                },
                {
                    data: [
                        0, 2, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 4,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    ],
                    ...fromEndpointInfo('/api/client'),
                },
            ],
            labels: Array.from({ length: 31 }).map((_, index) =>
                (index + 1).toString(),
            ),
        };

        expect(toTrafficUsageChartData(input)).toMatchObject(expectedOutput);
    });

    test('sorts endpoints according to endpoint data spec', () => {
        const input: TrafficUsageDataSegmentedCombinedSchema = {
            grouping: 'daily',
            dateRange: {
                from: '2025-01-01',
                to: '2025-01-31',
            },
            apiData: [
                { apiPath: '/api/frontend', dataPoints: [] },
                { apiPath: '/api/client', dataPoints: [] },
                { apiPath: '/api/admin', dataPoints: [] },
            ],
        };

        const expectedOutput = {
            datasets: [
                { label: 'Admin' },
                { label: 'Frontend' },
                { label: 'Server' },
            ],
        };

        expect(toTrafficUsageChartData(input)).toMatchObject(expectedOutput);
    });
});
