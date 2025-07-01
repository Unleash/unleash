import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { ChartConfig, ImpactMetricsState } from '../types.ts';

const encodeState = (
    state: ImpactMetricsState | null | undefined,
): string | undefined =>
    state && state.charts.length > 0 ? btoa(JSON.stringify(state)) : undefined;

const decodeState = (
    value: string | (string | null)[] | null | undefined,
): ImpactMetricsState | null => {
    if (typeof value !== 'string') return null;
    try {
        return JSON.parse(atob(value));
    } catch {
        return null;
    }
};

export const useUrlState = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [storedState, setStoredState] =
        useLocalStorageState<ImpactMetricsState>('impact-metrics-state', {
            charts: [],
        });

    const urlState = decodeState(searchParams.get('data'));
    const currentState = urlState || storedState;

    useEffect(() => {
        if (urlState) {
            setStoredState(urlState);
        } else if (storedState.charts.length > 0) {
            const encoded = encodeState(storedState);
            if (encoded) {
                setSearchParams(
                    (prev) => {
                        prev.set('data', encoded);
                        return prev;
                    },
                    { replace: true },
                );
            }
        }
    }, [urlState, storedState.charts.length, setStoredState, setSearchParams]);

    const updateState = useCallback(
        (newState: ImpactMetricsState) => {
            setStoredState(newState);
            setSearchParams(
                (prev) => {
                    const encoded = encodeState(newState);
                    if (encoded) {
                        prev.set('data', encoded);
                    } else {
                        prev.delete('data');
                    }
                    return prev;
                },
                { replace: true },
            );
        },
        [setStoredState, setSearchParams],
    );

    const addChart = useCallback(
        (config: Omit<ChartConfig, 'id'>) => {
            const newChart: ChartConfig = {
                ...config,
                id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };

            updateState({
                charts: [...currentState.charts, newChart],
            });
        },
        [currentState.charts, updateState],
    );

    const updateChart = useCallback(
        (id: string, updates: Partial<ChartConfig>) => {
            updateState({
                charts: currentState.charts.map((chart) =>
                    chart.id === id ? { ...chart, ...updates } : chart,
                ),
            });
        },
        [currentState.charts, updateState],
    );

    const deleteChart = useCallback(
        (id: string) => {
            updateState({
                charts: currentState.charts.filter((chart) => chart.id !== id),
            });
        },
        [currentState.charts, updateState],
    );

    return {
        charts: currentState.charts,
        addChart,
        updateChart,
        deleteChart,
    };
};
