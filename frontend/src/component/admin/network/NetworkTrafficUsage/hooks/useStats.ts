import {
    type ChartDataSelection,
    toDateRange,
} from '../chart-data-selection.js';
import { useTrafficSearch } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { currentDate } from '../dates.js';
import { useMemo } from 'react';
import {
    toConnectionChartData,
    toRequestChartData,
    toTrafficUsageChartData,
} from '../chart-functions.js';
import {
    calculateEstimatedMonthlyCost,
    calculateOverageCost,
    calculateTotalUsage,
} from 'utils/traffic-calculations';
import { averageTrafficPreviousMonths } from '../average-traffic-previous-months.js';
import { useConnectionsConsumption } from 'hooks/api/getters/useConnectionsConsumption/useConnectionsConsumption';
import { useRequestsConsumption } from 'hooks/api/getters/useRequestsConsumption/useRequestsConsumption';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { useInstancePrices } from 'hooks/api/getters/useInstancePrices/useInstancePrices';

export const useTrafficStats = (
    includedTraffic: number,
    chartDataSelection: ChartDataSelection,
    filter?: string,
) => {
    const { result } = useTrafficSearch(
        chartDataSelection.grouping,
        toDateRange(chartDataSelection, currentDate),
    );
    const { instanceStatus } = useInstanceStatus();
    const { instancePrices } = useInstancePrices();
    const trafficPrice = instanceStatus?.billing === 'pay-as-you-go' ? instancePrices.payg.traffic : instancePrices.pro.traffic;

    const results = useMemo(() => {
        if (result.state !== 'success') {
            return {
                chartData: { datasets: [], labels: [] },
                usageTotal: 0,
                overageCost: 0,
                estimatedMonthlyCost: 0,
                requestSummaryUsage: 0,
            };
        }
        const traffic = result.data;

        const chartData = toTrafficUsageChartData(traffic, filter);
        const usageTotal = calculateTotalUsage(traffic);
        const overageCost = calculateOverageCost(
            usageTotal,
            includedTraffic,
            trafficPrice,
        );

        const estimatedMonthlyCost = calculateEstimatedMonthlyCost(
            traffic.apiData,
            includedTraffic,
            currentDate,
            trafficPrice,
        );

        const requestSummaryUsage =
            chartDataSelection.grouping === 'daily'
                ? usageTotal
                : averageTrafficPreviousMonths(traffic);

        return {
            chartData,
            usageTotal,
            overageCost,
            estimatedMonthlyCost,
            requestSummaryUsage,
        };
    }, [
        JSON.stringify(result),
        includedTraffic,
        JSON.stringify(chartDataSelection),
        trafficPrice,
    ]);

    return results;
};

export const useConsumptionStats = (chartDataSelection: ChartDataSelection) => {
    const { result } = useConnectionsConsumption(
        chartDataSelection.grouping,
        toDateRange(chartDataSelection, currentDate),
    );
    const results = useMemo(() => {
        if (result.state !== 'success') {
            return {
                chartData: { datasets: [], labels: [] },
            };
        }
        const traffic = result.data;

        const chartData = toConnectionChartData(traffic);

        return {
            chartData,
        };
    }, [JSON.stringify(result), JSON.stringify(chartDataSelection)]);

    return results;
};

export const useRequestsStats = (chartDataSelection: ChartDataSelection) => {
    const { result } = useRequestsConsumption(
        chartDataSelection.grouping,
        toDateRange(chartDataSelection, currentDate),
    );
    const results = useMemo(() => {
        if (result.state !== 'success') {
            return {
                chartData: { datasets: [], labels: [] },
            };
        }
        const traffic = result.data;

        const chartData = toRequestChartData(traffic);

        return {
            chartData,
        };
    }, [JSON.stringify(result), JSON.stringify(chartDataSelection)]);

    return results;
};
