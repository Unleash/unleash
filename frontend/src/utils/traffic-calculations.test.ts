import { getDaysInMonth } from 'date-fns';
import {
    calculateEstimatedMonthlyCost,
    calculateOverageCost,
    calculateProjectedUsage,
    cleanTrafficData,
} from './traffic-calculations';
import { toSelectablePeriod } from '../component/admin/network/NetworkTrafficUsage/selectable-periods';
import type { TrafficUsageDataSegmentedCombinedSchema } from 'openapi';

const testData4Days = [
    {
        label: 'Frontend',
        data: [23_000_000, 22_000_000, 24_000_000, 21_000_000],
        backgroundColor: 'red',
        hoverBackgroundColor: 'red',
    },
    {
        label: 'Admin',
        data: [23_000_000, 22_000_000, 24_000_000, 21_000_000],
        backgroundColor: 'red',
        hoverBackgroundColor: 'red',
    },
    {
        label: 'SDK',
        data: [23_000_000, 22_000_000, 24_000_000, 21_000_000],
        backgroundColor: 'red',
        hoverBackgroundColor: 'red',
    },
];

describe('traffic overage calculation', () => {
    it('should return 0 if there is no overage this month', () => {
        const dataUsage = 52_900_000;
        const includedTraffic = 53_000_000;
        const result = calculateOverageCost(dataUsage, includedTraffic);
        expect(result).toBe(0);
    });

    it('should return 0 if overage this month is atleast 1 request above included', () => {
        const dataUsage = 53_000_001;
        const includedTraffic = 53_000_000;
        const result = calculateOverageCost(dataUsage, includedTraffic);
        expect(result).toBe(0);
    });

    it('should return 5 if overage this month is atleast 1M request above included', () => {
        const dataUsage = 54_000_000;
        const includedTraffic = 53_000_000;
        const result = calculateOverageCost(dataUsage, includedTraffic);
        expect(result).toBe(5);
    });

    it('should return 10 if overage this month is > 2M request above included', () => {
        const dataUsage = 55_100_000;
        const includedTraffic = 53_000_000;
        const result = calculateOverageCost(dataUsage, includedTraffic);
        expect(result).toBe(10);
    });

    it('doesnt estimate when having less than 5 days worth of data', () => {
        const now = new Date();
        const period = toSelectablePeriod(now);
        const testNow = new Date(now.getFullYear(), now.getMonth(), 4);
        const result = calculateEstimatedMonthlyCost(
            period.key,
            testData4Days,
            53_000_000,
            testNow,
        );
        expect(result).toBe(0);
    });

    it('needs 5 days or more to estimate for the month', () => {
        const testData = testData4Days;
        testData[0].data.push(23_000_000);
        testData[1].data.push(23_000_000);
        testData[2].data.push(23_000_000);
        const now = new Date();
        const period = toSelectablePeriod(now);
        const testNow = new Date(now.getFullYear(), now.getMonth(), 5);
        const result = calculateEstimatedMonthlyCost(
            period.key,
            testData,
            53_000_000,
            testNow,
        );
        expect(result).toBeGreaterThan(1430);
    });

    it('estimates projected data usage', () => {
        const testData = testData4Days;
        testData[0].data.push(22_500_000);
        testData[1].data.push(22_500_000);
        testData[2].data.push(22_500_000);
        // Testing April 5th of 2024 (30 days)
        const now = new Date(2024, 3, 5);
        const period = toSelectablePeriod(now);
        const result = calculateProjectedUsage(
            now.getDate(),
            testData,
            period.dayCount,
        );
        // 22_500_000 * 3 * 30 = 2_025_000_000
        expect(result).toBe(2_025_000_000);
    });

    it('supports custom price and unit size', () => {
        const dataUsage = 54_000_000;
        const includedTraffic = 53_000_000;
        const result = calculateOverageCost(
            dataUsage,
            includedTraffic,
            10,
            500_000,
        );
        expect(result).toBe(20);
    });

    it('estimates based on custom price and unit size', () => {
        const testData = testData4Days;
        testData[0].data.push(22_500_000);
        testData[1].data.push(22_500_000);
        testData[2].data.push(22_500_000);
        const now = new Date();
        const period = toSelectablePeriod(now);
        const testNow = new Date(now.getFullYear(), now.getMonth(), 5);
        const includedTraffic = 53_000_000;
        const trafficUnitSize = 500_000;
        const trafficUnitCost = 10;
        const result = calculateEstimatedMonthlyCost(
            period.key,
            testData,
            includedTraffic,
            testNow,
            trafficUnitCost,
            trafficUnitSize,
        );

        const totalExpectedUsage = 22_500_000 * 3 * getDaysInMonth(now);
        const overage = totalExpectedUsage - includedTraffic;
        const overageUnits = Math.floor(overage / trafficUnitSize);
        const total = overageUnits * trafficUnitCost;
        expect(result).toBe(total);
    });
});

describe('filtering out unwanted data', () => {
    test('it removes the /edge endpoint data', () => {
        const input: TrafficUsageDataSegmentedCombinedSchema = {
            grouping: 'daily',
            dateRange: { from: '2025-02-01', to: '2025-02-28' },
            apiData: [
                { apiPath: '/api/client', dataPoints: [] },
                { apiPath: '/edge', dataPoints: [] },
                { apiPath: '/api/admin', dataPoints: [] },
                { apiPath: '/api/frontend', dataPoints: [] },
            ],
        };

        const expected = {
            grouping: 'daily',
            dateRange: { from: '2025-02-01', to: '2025-02-28' },
            apiData: [
                { apiPath: '/api/client', dataPoints: [] },
                { apiPath: '/api/admin', dataPoints: [] },
                { apiPath: '/api/frontend', dataPoints: [] },
            ],
        };

        expect(cleanTrafficData(input)).toStrictEqual(expected);
    });

    test('it removes any data from before the traffic measuring was put in place', () => {
        const input: TrafficUsageDataSegmentedCombinedSchema = {
            grouping: 'monthly',
            dateRange: {
                from: '2024-02-01',
                to: '2025-06-31',
            },
            apiData: [
                {
                    apiPath: '/api/client',
                    dataPoints: [
                        { period: '2024-06', trafficTypes: [] },
                        { period: '2024-05', trafficTypes: [] },
                        { period: '2024-04', trafficTypes: [] },
                        { period: '2024-03', trafficTypes: [] },
                        { period: '2024-02', trafficTypes: [] },
                    ],
                },
            ],
        };

        const expected = {
            grouping: 'monthly',
            dateRange: {
                from: '2024-02-01',
                to: '2025-06-31',
            },
            apiData: [
                {
                    apiPath: '/api/client',
                    dataPoints: [
                        { period: '2024-06', trafficTypes: [] },
                        { period: '2024-05', trafficTypes: [] },
                    ],
                },
            ],
        };

        expect(cleanTrafficData(input)).toStrictEqual(expected);
    });
});
