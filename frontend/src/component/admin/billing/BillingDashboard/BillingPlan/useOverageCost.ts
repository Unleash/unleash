import { endOfMonth, format, startOfMonth } from 'date-fns';
import {
    useInstanceTrafficMetrics,
    useTrafficSearch,
} from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { useMemo } from 'react';
import {
    calculateOverageCost,
    calculateTotalUsage,
} from 'utils/traffic-calculations';
import { BILLING_TRAFFIC_BUNDLE_PRICE } from './BillingPlan';
import { useUiFlag } from 'hooks/useUiFlag';
import { useTrafficDataEstimation } from 'hooks/useTrafficData';

export const useOverageCost = (includedTraffic: number) => {
    if (useUiFlag('dataUsageMultiMonthView')) {
        return useNewOverageCostCalculation(includedTraffic);
    } else {
        return useOldOverageCostCalculation(includedTraffic);
    }
};

const useNewOverageCostCalculation = (includedTraffic: number) => {
    if (!includedTraffic) {
        return 0;
    }

    const now = new Date();
    const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
    const from = formatDate(startOfMonth(now));
    const to = formatDate(endOfMonth(now));

    const { result } = useTrafficSearch('daily', { from, to });
    const overageCost = useMemo(() => {
        if (result.state !== 'success') {
            return 0;
        }

        const totalUsage = calculateTotalUsage(result.data);
        return calculateOverageCost(
            totalUsage,
            includedTraffic,
            BILLING_TRAFFIC_BUNDLE_PRICE,
        );
    }, [includedTraffic, JSON.stringify(result)]);

    return overageCost;
};

const useOldOverageCostCalculation = (includedTraffic: number) => {
    const {
        currentPeriod,
        toChartData,
        toTrafficUsageSum,
        endpointsInfo,
        getDayLabels,
    } = useTrafficDataEstimation();

    const traffic = useInstanceTrafficMetrics(currentPeriod.key);

    const overageCost = useMemo(() => {
        if (!includedTraffic) {
            return 0;
        }
        const trafficData = toChartData(
            getDayLabels(currentPeriod.dayCount),
            traffic,
            endpointsInfo,
        );
        const totalTraffic = toTrafficUsageSum(trafficData);
        return calculateOverageCost(
            totalTraffic,
            includedTraffic,
            BILLING_TRAFFIC_BUNDLE_PRICE,
        );
    }, [includedTraffic, traffic, currentPeriod, endpointsInfo]);

    return overageCost;
};
