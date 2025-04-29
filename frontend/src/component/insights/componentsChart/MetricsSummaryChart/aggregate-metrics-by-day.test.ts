import { aggregateDataPerDate } from './aggregate-metrics-by-day.js';

describe('aggregateDataPerDate', () => {
    it('should correctly aggregate data for a single item', () => {
        const items = [
            {
                date: '2024-03-19',
                totalFlags: 5,
                totalNo: 2,
                totalRequests: 7,
                totalYes: 3,
                project: 'default',
                totalApps: 2,
                totalEnvironments: 3,
                week: '2024-01',
            },
        ];

        const expected = {
            '2024-03-19': {
                totalFlags: 5,
                totalNo: 2,
                totalRequests: 7,
                totalYes: 3,
            },
        };

        expect(aggregateDataPerDate(items)).toEqual(expected);
    });

    it('should aggregate multiple items for the same date correctly', () => {
        const items = [
            {
                date: '2024-03-19',
                totalFlags: 1,
                totalNo: 2,
                totalRequests: 3,
                totalYes: 4,
                project: 'default',
                totalApps: 2,
                totalEnvironments: 3,
                week: '2024-01',
            },
            {
                date: '2024-03-19',
                totalFlags: 5,
                totalNo: 6,
                totalRequests: 7,
                totalYes: 8,
                project: 'default',
                totalApps: 2,
                totalEnvironments: 3,
                week: '2024-01',
            },
        ];

        const expected = {
            '2024-03-19': {
                totalFlags: 6,
                totalNo: 8,
                totalRequests: 10,
                totalYes: 12,
            },
        };

        expect(aggregateDataPerDate(items)).toEqual(expected);
    });

    it('should aggregate items across different dates correctly', () => {
        const items = [
            {
                date: '2024-03-18',
                totalFlags: 10,
                totalNo: 20,
                totalRequests: 30,
                totalYes: 40,
                project: 'default',
                totalApps: 2,
                totalEnvironments: 3,
                week: '2024-01',
            },
            {
                date: '2024-03-19',
                totalFlags: 1,
                totalNo: 2,
                totalRequests: 3,
                totalYes: 4,
                project: 'default',
                totalApps: 2,
                totalEnvironments: 3,
                week: '2024-01',
            },
        ];

        const expected = {
            '2024-03-18': {
                totalFlags: 10,
                totalNo: 20,
                totalRequests: 30,
                totalYes: 40,
            },
            '2024-03-19': {
                totalFlags: 1,
                totalNo: 2,
                totalRequests: 3,
                totalYes: 4,
            },
        };

        expect(aggregateDataPerDate(items)).toEqual(expected);
    });

    it('should correctly handle items with all metrics at zero', () => {
        const items = [
            {
                date: '2024-03-19',
                totalFlags: 0,
                totalNo: 0,
                totalRequests: 0,
                totalYes: 0,
                project: 'default',
                totalApps: 2,
                totalEnvironments: 3,
                week: '2024-01',
            },
        ];

        const expected = {
            '2024-03-19': {
                totalFlags: 0,
                totalNo: 0,
                totalRequests: 0,
                totalYes: 0,
            },
        };

        expect(aggregateDataPerDate(items)).toEqual(expected);
    });

    it('should return an empty object for an empty array input', () => {
        expect(aggregateDataPerDate([])).toEqual({});
    });

    // Test for immutability of input
    it('should not mutate the input array', () => {
        const items = [
            {
                date: '2024-03-19',
                totalFlags: 1,
                totalNo: 2,
                totalRequests: 3,
                totalYes: 4,
                project: 'default',
                totalApps: 2,
                totalEnvironments: 3,
                week: '2024-01',
            },
        ];
        const itemsCopy = [...items];

        aggregateDataPerDate(items);

        expect(items).toEqual(itemsCopy);
    });
});
