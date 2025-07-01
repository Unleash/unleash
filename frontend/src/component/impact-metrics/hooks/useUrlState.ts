import { useCallback, useMemo } from 'react';
import { withDefault } from 'use-query-params';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import type { ChartConfig, ImpactMetricsState, LayoutItem } from '../types.ts';

const createArrayParam = <T>() => ({
    encode: (items: T[]): string =>
        items.length > 0 ? btoa(JSON.stringify(items)) : '',

    decode: (value: string | (string | null)[] | null | undefined): T[] => {
        if (typeof value !== 'string' || !value) return [];
        try {
            return JSON.parse(atob(value));
        } catch {
            return [];
        }
    },
});

const ChartsParam = createArrayParam<ChartConfig>();
const LayoutParam = createArrayParam<LayoutItem>();

export const useUrlState = () => {
    const stateConfig = {
        charts: withDefault(ChartsParam, []),
        layout: withDefault(LayoutParam, []),
    };

    const [tableState, setTableState] = usePersistentTableState(
        'impact-metrics-state',
        stateConfig,
    );

    const currentState: ImpactMetricsState = useMemo(
        () => ({
            charts: tableState.charts || [],
            layout: tableState.layout || [],
        }),
        [tableState.charts, tableState.layout],
    );

    const updateState = useCallback(
        (newState: ImpactMetricsState) => {
            setTableState({
                charts: newState.charts,
                layout: newState.layout,
            });
        },
        [setTableState],
    );

    const addChart = useCallback(
        (config: Omit<ChartConfig, 'id'>) => {
            const newChart: ChartConfig = {
                ...config,
                id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };

            const maxY =
                currentState.layout.length > 0
                    ? Math.max(
                          ...currentState.layout.map((item) => item.y + item.h),
                      )
                    : 0;

            const newLayoutItem: LayoutItem = {
                i: newChart.id,
                x: 0,
                y: maxY,
                w: 6,
                h: 4,
                minW: 4,
                minH: 2,
                maxW: 12,
                maxH: 8,
            };

            updateState({
                charts: [...currentState.charts, newChart],
                layout: [...currentState.layout, newLayoutItem],
            });
        },
        [currentState.charts, currentState.layout, updateState],
    );

    const updateChart = useCallback(
        (id: string, updates: Partial<ChartConfig>) => {
            updateState({
                charts: currentState.charts.map((chart) =>
                    chart.id === id ? { ...chart, ...updates } : chart,
                ),
                layout: currentState.layout,
            });
        },
        [currentState.charts, currentState.layout, updateState],
    );

    const deleteChart = useCallback(
        (id: string) => {
            updateState({
                charts: currentState.charts.filter((chart) => chart.id !== id),
                layout: currentState.layout.filter((item) => item.i !== id),
            });
        },
        [currentState.charts, currentState.layout, updateState],
    );

    const updateLayout = useCallback(
        (newLayout: LayoutItem[]) => {
            updateState({
                charts: currentState.charts,
                layout: newLayout,
            });
        },
        [currentState.charts, updateState],
    );

    return {
        charts: currentState.charts || [],
        layout: currentState.layout || [],
        addChart,
        updateChart,
        deleteChart,
        updateLayout,
    };
};
