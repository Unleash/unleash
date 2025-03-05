import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useTrafficSearch } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { useMemo } from 'react';
import {
    calculateOverageCost,
    calculateTotalUsage,
} from 'utils/traffic-calculations';
import { BILLING_TRAFFIC_BUNDLE_PRICE } from './BillingPlan';

export const useOverageCost = (includedTraffic: number) =>
    useNewOverageCostCalculation(includedTraffic);

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
