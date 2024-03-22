import { useMemo } from 'react';
import type {
    InstanceInsightsSchemaProjectFlagTrendsItem,
    InstanceInsightsSchemaUsers,
} from 'openapi';

// NOTE: should we move project filtering to the backend?
export const useFilteredFlagsSummary = (
    filteredProjectFlagTrends: InstanceInsightsSchemaProjectFlagTrendsItem[],
    users: InstanceInsightsSchemaUsers,
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

        const flagsPerUserCalculation = sum.total / users.total;
        const flagsPerUser = Number.isNaN(flagsPerUserCalculation)
            ? 'N/A'
            : flagsPerUserCalculation.toFixed(2);

        return {
            ...sum,
            flagsPerUser,
            averageUsers,
            averageHealth: sum.total
                ? ((sum.active / (sum.total || 1)) * 100).toFixed(0)
                : undefined,
        };
    }, [filteredProjectFlagTrends]);
