import { useCallback, useMemo } from 'react';
import type { ChartConfig } from '../types.ts';
import { useImpactMetricsConfig } from 'hooks/api/getters/useImpactMetricsConfig/useImpactMetricsConfig.ts';
import { useImpactMetricsApi } from 'hooks/api/actions/useImpactMetricsApi/useImpactMetricsApi.ts';

/**
 * "Select all" represents all current and future labels.
 * Asterisk (*) is sent to the backend. This will create a different query then sending every current label.
 */
export const METRIC_LABELS_SELECT_ALL = '*';

export const useImpactMetricsState = () => {
    const {
        configs,
        loading: configLoading,
        error: configError,
        refetch,
    } = useImpactMetricsConfig();

    const { layout, charts } = useMemo(
        () => ({
            layout: configs.map((config, index) => {
                const column = index % 2;
                const row = Math.floor(index / 2);

                return {
                    i: config.id,
                    x: column * 6,
                    y: row * 2,
                    w: 6,
                    h: 2,
                    minW: 4,
                    minH: 2,
                    maxW: 12,
                    maxH: 8,
                };
            }),
            charts: configs,
        }),
        [configs],
    );

    const {
        createImpactMetric,
        deleteImpactMetric,
        loading: actionLoading,
        errors: actionErrors,
    } = useImpactMetricsApi();

    const addChart = useCallback(
        async (config: Omit<ChartConfig, 'id'>) => {
            await createImpactMetric(config);
            refetch();
        },
        [createImpactMetric, refetch],
    );

    const updateChart = useCallback(
        async (id: string, updates: Omit<ChartConfig, 'id'>) => {
            await createImpactMetric({ ...updates, id });
            refetch();
        },
        [configs, createImpactMetric, refetch],
    );

    const deleteChart = useCallback(
        async (id: string) => {
            await deleteImpactMetric(id);
            refetch();
        },
        [configs, deleteImpactMetric, refetch],
    );

    return {
        charts,
        layout,
        loading: configLoading || actionLoading,
        error:
            configError || Object.keys(actionErrors).length > 0
                ? actionErrors
                : undefined,
        addChart,
        updateChart,
        deleteChart,
    };
};
