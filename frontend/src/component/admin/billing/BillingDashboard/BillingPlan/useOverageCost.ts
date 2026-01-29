import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useTrafficSearch } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { useMemo } from 'react';
import {
    calculateOverageCost,
    calculateTotalUsage,
} from 'utils/traffic-calculations';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { useInstancePrices } from 'hooks/api/getters/useInstancePrices/useInstancePrices';

export const useOverageCost = (includedTraffic: number) => {
    const now = new Date();
    const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
    const from = formatDate(startOfMonth(now));
    const to = formatDate(endOfMonth(now));

    const { instanceStatus } = useInstanceStatus();
    const { instancePrices } = useInstancePrices();
    const trafficPrice =
        instanceStatus?.billing === 'pay-as-you-go'
            ? instancePrices.payg.traffic
            : instancePrices.pro.traffic;

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
