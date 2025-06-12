import { useMemo } from 'react';
import type { InstanceInsightsSchemaProjectFlagTrendsItem } from 'openapi';

const validTimeToProduction = (
    item: InstanceInsightsSchemaProjectFlagTrendsItem,
) =>
    Boolean(item) &&
    typeof item.timeToProduction === 'number' &&
    item.timeToProduction !== 0;

// NOTE: should we move project filtering to the backend?
export const useFilteredFlagsSummary = (
    filteredProjectFlagTrends: InstanceInsightsSchemaProjectFlagTrendsItem[],
) =>
    useMemo(() => {
        const lastWeekId = filteredProjectFlagTrends.reduce((prev, current) => {
            if (current.week > prev) return current.week;
            return prev;
        }, '');

        const lastWeekSummary = filteredProjectFlagTrends.filter(
            (summary) => summary.week === lastWeekId,
        );

        const averageUsers =
            lastWeekSummary.reduce(
                (acc, current) => acc + (current.users || 0),
                0,
            ) / lastWeekSummary.length || 0;

        const sum = lastWeekSummary.reduce(
            (acc, current) => ({
                total: acc.total + current.total,
                active: acc.active + current.active,
                stale: acc.stale + current.stale,
                potentiallyStale:
                    acc.potentiallyStale + current.potentiallyStale,
                averageUsers,
            }),
            {
                total: 0,
                active: 0,
                stale: 0,
                potentiallyStale: 0,
            },
        );

        const timesToProduction: number[] = lastWeekSummary
            .filter(validTimeToProduction)
            .map((item) => item.timeToProduction!);

        // Calculate median timeToProduction for lastWeekSummary
        timesToProduction.sort((a, b) => a - b);
        const midIndex = Math.floor(timesToProduction.length / 2);
        const medianTimeToProductionCalculation =
            timesToProduction.length % 2 === 0
                ? (timesToProduction[midIndex - 1] +
                      timesToProduction[midIndex]) /
                  2
                : timesToProduction[midIndex];

        const medianTimeToProduction = Number.isNaN(
            medianTimeToProductionCalculation,
        )
            ? undefined
            : medianTimeToProductionCalculation;

        return {
            ...sum,
            averageUsers,
            averageHealth: sum.total
                ? ((sum.active / (sum.total || 1)) * 100).toFixed(0)
                : '100',
            technicalDebt: sum.total
                ? (
                      ((sum.stale + sum.potentiallyStale) / sum.total) *
                      100
                  ).toFixed(0)
                : '0',
            medianTimeToProduction,
        };
    }, [filteredProjectFlagTrends]);
