import type {
    TrafficUsageDataSegmentedCombinedSchema,
    TrafficUsageDataSegmentedCombinedSchemaApiDataItem,
} from 'openapi';
import {
    currentMonth,
    daysInCurrentMonth,
} from '../component/admin/network/NetworkTrafficUsage/dates';
import type { ChartDatasetType } from '../component/admin/network/NetworkTrafficUsage/chart-functions';

const DEFAULT_TRAFFIC_DATA_UNIT_COST = 5;
const DEFAULT_TRAFFIC_DATA_UNIT_SIZE = 1_000_000;

export const TRAFFIC_MEASUREMENT_START_DATE = new Date('2024-05-01');

export const METERED_TRAFFIC_ENDPOINTS = [
    '/api/admin',
    '/api/frontend',
    '/api/client',
];

export const cleanTrafficData = (
    data?: TrafficUsageDataSegmentedCombinedSchema,
): TrafficUsageDataSegmentedCombinedSchema | undefined => {
    if (!data) {
        return;
    }

    const { apiData, ...rest } = data;
    const cleanedApiData = apiData
        .filter((item) => METERED_TRAFFIC_ENDPOINTS.includes(item.apiPath))
        .map((item) => {
            item.dataPoints = item.dataPoints.filter(
                ({ period }) =>
                    new Date(period) >= TRAFFIC_MEASUREMENT_START_DATE,
            );
            return item;
        });
    return { apiData: cleanedApiData, ...rest };
};

// todo: extract "currentMonth" into a function argument instead
const monthlyTrafficDataToCurrentUsage = (
    apiData: TrafficUsageDataSegmentedCombinedSchemaApiDataItem[],
) => {
    return apiData.reduce((acc, current) => {
        const currentPoint = current.dataPoints.find(
            ({ period }) => period === currentMonth,
        );
        const pointUsage =
            currentPoint?.trafficTypes.reduce(
                (acc, next) => acc + next.count,
                0,
            ) ?? 0;
        return acc + pointUsage;
    }, 0);
};

const dailyTrafficDataToCurrentUsage = (
    apiData: TrafficUsageDataSegmentedCombinedSchemaApiDataItem[],
) => {
    return apiData
        .flatMap((endpoint) =>
            endpoint.dataPoints.flatMap((dataPoint) =>
                dataPoint.trafficTypes.map((trafficType) => trafficType.count),
            ),
        )
        .reduce((acc, count) => acc + count, 0);
};

// todo: test
// Return the total number of requests for the selected month if showing daily
// data, or the current month if showing monthly data
export const calculateTotalUsage = (
    data?: TrafficUsageDataSegmentedCombinedSchema,
): number => {
    if (!data) {
        return 0;
    }
    const { grouping, apiData } = data;
    return grouping === 'monthly'
        ? monthlyTrafficDataToCurrentUsage(apiData)
        : dailyTrafficDataToCurrentUsage(apiData);
};

const calculateTrafficDataCost = (
    trafficData: number,
    trafficUnitCost = DEFAULT_TRAFFIC_DATA_UNIT_COST,
    trafficUnitSize = DEFAULT_TRAFFIC_DATA_UNIT_SIZE,
) => {
    const unitCount = Math.ceil(trafficData / trafficUnitSize);
    return unitCount * trafficUnitCost;
};

export const calculateOverageCost = (
    dataUsage: number,
    includedTraffic: number,
    trafficUnitCost = DEFAULT_TRAFFIC_DATA_UNIT_COST,
    trafficUnitSize = DEFAULT_TRAFFIC_DATA_UNIT_SIZE,
): number => {
    if (dataUsage === 0) {
        return 0;
    }

    const overage =
        Math.floor((dataUsage - includedTraffic) / 1_000_000) * 1_000_000;
    return overage > 0
        ? calculateTrafficDataCost(overage, trafficUnitCost, trafficUnitSize)
        : 0;
};

export const calculateProjectedUsage = (
    today: number,
    trafficData: ChartDatasetType[],
    daysInPeriod: number,
) => {
    if (today < 5) {
        return 0;
    }

    const spliceToYesterday = today - 1;
    const trafficDataUpToYesterday = trafficData.map((item) => {
        return {
            ...item,
            data: item.data.slice(0, spliceToYesterday),
        };
    });

    const toTrafficUsageSum = (trafficData: ChartDatasetType[]): number => {
        const data = trafficData.reduce(
            (acc: number, current: ChartDatasetType) => {
                return (
                    acc +
                    current.data.reduce(
                        (acc_inner, current_inner) => acc_inner + current_inner,
                        0,
                    )
                );
            },
            0,
        );
        return data;
    };

    const dataUsage = toTrafficUsageSum(trafficDataUpToYesterday);
    return (dataUsage / spliceToYesterday) * daysInPeriod;
};

export const calculateEstimatedMonthlyCost = (
    period: string,
    trafficData: ChartDatasetType[],
    includedTraffic: number,
    currentDate: Date,
    trafficUnitCost = DEFAULT_TRAFFIC_DATA_UNIT_COST,
    trafficUnitSize = DEFAULT_TRAFFIC_DATA_UNIT_SIZE,
) => {
    if (period !== currentMonth) {
        return 0;
    }

    const today = currentDate.getDate();
    const projectedUsage = calculateProjectedUsage(
        today,
        trafficData,
        daysInCurrentMonth,
    );

    return calculateOverageCost(
        projectedUsage,
        includedTraffic,
        trafficUnitCost,
        trafficUnitSize,
    );
};
