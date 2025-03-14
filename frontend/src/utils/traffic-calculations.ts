import type {
    TrafficUsageDataSegmentedCombinedSchema,
    TrafficUsageDataSegmentedCombinedSchemaApiDataItem,
} from 'openapi';
import { getDaysInMonth } from 'date-fns';
import { format } from 'date-fns';
import { parseDateString } from 'component/admin/network/NetworkTrafficUsage/dates';
export const DEFAULT_TRAFFIC_DATA_UNIT_COST = 5;
export const DEFAULT_TRAFFIC_DATA_UNIT_SIZE = 1_000_000;

export const TRAFFIC_MEASUREMENT_START_DATE = parseDateString('2024-05-01');

export const METERED_TRAFFIC_ENDPOINTS = [
    '/api/admin',
    '/api/frontend',
    '/api/client',
];

export const cleanTrafficData = (
    data: TrafficUsageDataSegmentedCombinedSchema,
): TrafficUsageDataSegmentedCombinedSchema => {
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

const monthlyTrafficDataToCurrentUsage = (
    apiData: TrafficUsageDataSegmentedCombinedSchemaApiDataItem[],
    latestMonth: string,
) => {
    return apiData.reduce((acc, current) => {
        const currentPoint = current.dataPoints.find(
            ({ period }) => period === latestMonth,
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

// Return the total number of requests for the selected month if showing daily
// data, or the total for the most recent month if showing monthly data
export const calculateTotalUsage = (
    data: TrafficUsageDataSegmentedCombinedSchema,
): number => {
    const { grouping, apiData } = data;
    if (grouping === 'monthly') {
        const latestMonth = format(new Date(data.dateRange.to), 'yyyy-MM');
        return monthlyTrafficDataToCurrentUsage(apiData, latestMonth);
    } else {
        return dailyTrafficDataToCurrentUsage(apiData);
    }
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
        Math.floor((dataUsage - includedTraffic) / trafficUnitSize) *
        trafficUnitSize;
    return overage > 0
        ? calculateTrafficDataCost(overage, trafficUnitCost, trafficUnitSize)
        : 0;
};

export const calculateProjectedUsage = ({
    dayOfMonth,
    daysInMonth,
    trafficData,
}: {
    dayOfMonth: number;
    daysInMonth: number;
    trafficData: TrafficUsageDataSegmentedCombinedSchemaApiDataItem[];
}) => {
    if (dayOfMonth < 5) {
        return 0;
    }

    const trafficDataUpToYesterday = trafficData.map((item) => {
        return {
            ...item,
            dataPoints: item.dataPoints.filter(
                (point) => Number(point.period.slice(-2)) < dayOfMonth,
            ),
        };
    });

    const dataUsage = dailyTrafficDataToCurrentUsage(trafficDataUpToYesterday);

    return (dataUsage / (dayOfMonth - 1)) * daysInMonth;
};

export const calculateEstimatedMonthlyCost = (
    trafficData: TrafficUsageDataSegmentedCombinedSchemaApiDataItem[],
    includedTraffic: number,
    currentDate: Date,
    trafficUnitCost = DEFAULT_TRAFFIC_DATA_UNIT_COST,
    trafficUnitSize = DEFAULT_TRAFFIC_DATA_UNIT_SIZE,
) => {
    if (!trafficData) {
        return 0;
    }
    const dayOfMonth = currentDate.getDate();
    const daysInMonth = getDaysInMonth(currentDate);

    const projectedUsage = calculateProjectedUsage({
        dayOfMonth,
        daysInMonth,
        trafficData,
    });

    return calculateOverageCost(
        projectedUsage,
        includedTraffic,
        trafficUnitCost,
        trafficUnitSize,
    );
};
