import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useTrafficSearch } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { useMemo } from 'react';
import {
    calculateOverageCost,
    calculateTotalUsage,
} from 'utils/traffic-calculations';
import { BILLING_TRAFFIC_PRICE } from './BillingPlan';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

export const useOverageCost = (includedTraffic: number) => {
    if (!includedTraffic) {
        return 0;
    }

    const now = new Date();
    const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
    const from = formatDate(startOfMonth(now));
    const to = formatDate(endOfMonth(now));

    // biome-ignore lint/correctness/useHookAtTopLevel: // FIXME: linter -- how to skip it if `includedTraffic` is 0?
    const { instanceStatus } = useInstanceStatus();
    const trafficPrice =
        instanceStatus?.prices?.[
            instanceStatus?.billing === 'pay-as-you-go' ? 'payg' : 'pro'
        ]?.traffic ?? BILLING_TRAFFIC_PRICE;

    // biome-ignore lint/correctness/useHookAtTopLevel: // FIXME: linter -- how to skip it if `includedTraffic` is 0?
    const { result } = useTrafficSearch('daily', { from, to });
    // biome-ignore lint/correctness/useHookAtTopLevel: // FIXME: linter -- how to skip it if `includedTraffic` is 0?
    const overageCost = useMemo(() => {
        if (result.state !== 'success') {
            return 0;
        }

        const totalUsage = calculateTotalUsage(result.data);
        return calculateOverageCost(totalUsage, includedTraffic, trafficPrice);
    }, [includedTraffic, JSON.stringify(result), trafficPrice]);

    return overageCost;
};
