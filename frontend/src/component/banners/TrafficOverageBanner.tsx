import { useUiFlag } from 'hooks/useUiFlag';
import { Banner } from './Banner/Banner';
import { useTrafficDataEstimation } from 'hooks/useTrafficData';
import { useTrafficLimit } from 'component/admin/network/NetworkTrafficUsage/hooks/useTrafficLimit';
import { useInstanceTrafficMetrics } from 'hooks/api/getters/useInstanceTrafficMetrics/useInstanceTrafficMetrics';
import { BILLING_TRAFFIC_BUNDLE_PRICE } from 'component/admin/billing/BillingDashboard/BillingPlan/BillingPlan';
import { useMemo } from 'react';

export const TrafficOverageBanner = () => {
    const estimateTrafficDataCostEnabled = useUiFlag('estimateTrafficDataCost');
    const includedTraffic = useTrafficLimit();
    const {
        currentPeriod,
        toChartData,
        toTrafficUsageSum,
        endpointsInfo,
        getDayLabels,
        calculateOverageCost,
        calculateEstimatedMonthlyCost,
    } = useTrafficDataEstimation();
    const traffic = useInstanceTrafficMetrics(currentPeriod.key);

    const trafficData = useMemo(
        () =>
            toChartData(
                getDayLabels(currentPeriod.dayCount),
                traffic,
                endpointsInfo,
            ),
        [traffic, currentPeriod, endpointsInfo],
    );

    const calculatedOverageCost = useMemo(
        () =>
            includedTraffic
                ? calculateOverageCost(
                      toTrafficUsageSum(trafficData),
                      includedTraffic,
                      BILLING_TRAFFIC_BUNDLE_PRICE,
                  )
                : 0,
        [includedTraffic, trafficData],
    );

    const estimatedMonthlyCost = useMemo(
        () =>
            includedTraffic && estimateTrafficDataCostEnabled
                ? calculateEstimatedMonthlyCost(
                      currentPeriod.key,
                      trafficData,
                      includedTraffic,
                      new Date(),
                      BILLING_TRAFFIC_BUNDLE_PRICE,
                  )
                : 0,
        [
            includedTraffic,
            estimateTrafficDataCostEnabled,
            trafficData,
            currentPeriod,
        ],
    );

    const overageMessage =
        calculatedOverageCost > 0
            ? `**Heads up!** You're using more requests than your plan [includes](https://www.getunleash.io/pricing), and additional charges will apply per our [terms](https://www.getunleash.io/fair-use-policy).`
            : estimatedMonthlyCost > 0
              ? `**Heads up!** Based on your current usage, you're projected to exceed your plan's [limit](https://www.getunleash.io/pricing), and additional charges may apply per our [terms](https://www.getunleash.io/fair-use-policy).`
              : undefined;

    if (!overageMessage) return null;

    return (
        <Banner
            banner={{
                message: overageMessage,
                variant: 'warning',
                sticky: true,
                link: '/admin/network/data-usage',
                linkText: 'See data usage',
            }}
        />
    );
};
