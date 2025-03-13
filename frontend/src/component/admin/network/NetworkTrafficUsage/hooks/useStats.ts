import { type ChartDataSelection, toDateRange } from '../chart-data-selection';
import { useTrafficSearch } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { currentDate } from '../dates';
import { useMemo } from 'react';
import {
    toConnectionChartData,
    toTrafficUsageChartData,
} from '../chart-functions';
import {
    calculateEstimatedMonthlyCost,
    calculateOverageCost,
    calculateTotalUsage,
} from 'utils/traffic-calculations';
import { BILLING_TRAFFIC_BUNDLE_PRICE } from '../../../billing/BillingDashboard/BillingPlan/BillingPlan';
import { averageTrafficPreviousMonths } from '../average-traffic-previous-months';

export const useTrafficStats = (
    includedTraffic: number,
    chartDataSelection: ChartDataSelection,
    filter?: string,
) => {
    const { result } = useTrafficSearch(
        chartDataSelection.grouping,
        toDateRange(chartDataSelection, currentDate),
    );
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
            BILLING_TRAFFIC_BUNDLE_PRICE,
        );

        const estimatedMonthlyCost = calculateEstimatedMonthlyCost(
            traffic.apiData,
            includedTraffic,
            currentDate,
            BILLING_TRAFFIC_BUNDLE_PRICE,
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
    ]);

    return results;
};

export const useConsumptionStats = (chartDataSelection: ChartDataSelection) => {
    const { result } = useTrafficSearch(
        chartDataSelection.grouping,
        toDateRange(chartDataSelection, currentDate),
    );
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

        const chartData = toConnectionChartData(traffic);

        return {
            chartData,
        };
    }, [JSON.stringify(result), JSON.stringify(chartDataSelection)]);

    return results;
};
