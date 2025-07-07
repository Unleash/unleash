import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useTrafficSearch } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { useMemo } from 'react';
import {
    calculateOverageCost,
    calculateTotalUsage,
} from 'utils/traffic-calculations';
import { BILLING_TRAFFIC_PRICE } from './BillingPlan.jsx';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

export const useOverageCost = (includedTraffic: number) => {
    const now = new Date();
    const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
    const from = formatDate(startOfMonth(now));
    const to = formatDate(endOfMonth(now));

    const { instanceStatus } = useInstanceStatus();
    const trafficPrice =
        instanceStatus?.prices?.[
            instanceStatus?.billing === 'pay-as-you-go' ? 'payg' : 'pro'
        ]?.traffic ?? BILLING_TRAFFIC_PRICE;

    const { result } = useTrafficSearch('daily', { from, to });
    const overageCost = useMemo(() => {
        if (result.state !== 'success') {
            return 0;
        }

        const totalUsage = calculateTotalUsage(result.data);
        return calculateOverageCost(totalUsage, includedTraffic, trafficPrice);
    }, [includedTraffic, JSON.stringify(result), trafficPrice]);

    return overageCost;
};
