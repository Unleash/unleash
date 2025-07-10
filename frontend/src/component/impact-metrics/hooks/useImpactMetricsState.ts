import { useCallback } from 'react';
import { useImpactMetricsSettings } from 'hooks/api/getters/useImpactMetricsSettings/useImpactMetricsSettings.js';
import { useImpactMetricsSettingsApi } from 'hooks/api/actions/useImpactMetricsSettingsApi/useImpactMetricsSettingsApi.js';
import type { ChartConfig, ImpactMetricsState, LayoutItem } from '../types.ts';

export const useImpactMetricsState = () => {
    const {
        settings,
        loading: settingsLoading,
        error: settingsError,
        refetch,
    } = useImpactMetricsSettings();

    const {
        updateSettings,
        loading: actionLoading,
        errors: actionErrors,
    } = useImpactMetricsSettingsApi();

    const addChart = useCallback(
        async (config: Omit<ChartConfig, 'id'>) => {
            const newChart: ChartConfig = {
                ...config,
                id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };

            const maxY =
                settings.layout.length > 0
                    ? Math.max(
                          ...settings.layout.map((item) => item.y + item.h),
                      )
                    : 0;

            const newState: ImpactMetricsState = {
                charts: [...settings.charts, newChart],
                layout: [
                    ...settings.layout,
                    {
                        i: newChart.id,
                        x: 0,
                        y: maxY,
                        w: 6,
                        h: 4,
                        minW: 4,
                        minH: 2,
                        maxW: 12,
                        maxH: 8,
                    },
                ],
            };

            await updateSettings(newState);
            refetch();
        },
        [settings, updateSettings, refetch],
    );

    const updateChart = useCallback(
        async (id: string, updates: Partial<ChartConfig>) => {
            const updatedCharts = settings.charts.map((chart) =>
                chart.id === id ? { ...chart, ...updates } : chart,
            );
            const newState: ImpactMetricsState = {
                charts: updatedCharts,
                layout: settings.layout,
            };
            await updateSettings(newState);
            refetch();
        },
        [settings, updateSettings, refetch],
    );

    const deleteChart = useCallback(
        async (id: string) => {
            const newState: ImpactMetricsState = {
                charts: settings.charts.filter((chart) => chart.id !== id),
                layout: settings.layout.filter((item) => item.i !== id),
            };
            await updateSettings(newState);
            refetch();
        },
        [settings, updateSettings, refetch],
    );

    const updateLayout = useCallback(
        async (newLayout: LayoutItem[]) => {
            const newState: ImpactMetricsState = {
                charts: settings.charts,
                layout: newLayout,
            };
            await updateSettings(newState);
            refetch();
        },
        [settings, updateSettings, refetch],
    );

    return {
        charts: settings.charts || [],
        layout: settings.layout || [],
        loading: settingsLoading || actionLoading,
        error:
            settingsError || Object.keys(actionErrors).length > 0
                ? actionErrors
                : undefined,
        addChart,
        updateChart,
        deleteChart,
        updateLayout,
    };
};
