import { useState, useEffect } from 'react';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import type { ChartConfig } from '../types.ts';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { getMetricType } from '../utils.ts';

type UseChartConfigParams = {
    open: boolean;
    initialConfig?: ChartConfig;
};

export type ChartFormState = {
    formData: {
        title: string;
        selectedSeries: string;
        selectedRange: 'hour' | 'day' | 'week' | 'month';
        beginAtZero: boolean;
        aggregationMode: 'rps' | 'count' | 'avg' | 'sum';
        selectedLabels: Record<string, string[]>;
    };
    actions: {
        setTitle: (title: string) => void;
        setSelectedSeries: (series: string) => void;
        setSelectedRange: (range: 'hour' | 'day' | 'week' | 'month') => void;
        setBeginAtZero: (beginAtZero: boolean) => void;
        setAggregationMode: (mode: 'rps' | 'count' | 'avg' | 'sum') => void;
        setSelectedLabels: (labels: Record<string, string[]>) => void;
        handleSeriesChange: (series: string) => void;
        getConfigToSave: () => Omit<ChartConfig, 'id'>;
    };
    isValid: boolean;
    currentAvailableLabels: ImpactMetricsLabels | undefined;
};

export const useChartFormState = ({
    open,
    initialConfig,
}: UseChartConfigParams): ChartFormState => {
    const [title, setTitle] = useState(initialConfig?.title || '');
    const [selectedSeries, setSelectedSeries] = useState(
        initialConfig?.selectedSeries || '',
    );
    const [selectedRange, setSelectedRange] = useState<
        'hour' | 'day' | 'week' | 'month'
    >(initialConfig?.selectedRange || 'day');
    const [beginAtZero, setBeginAtZero] = useState(
        initialConfig?.beginAtZero || false,
    );
    const [selectedLabels, setSelectedLabels] = useState<
        Record<string, string[]>
    >(initialConfig?.selectedLabels || {});
    const [aggregationMode, setAggregationMode] = useState<
        'rps' | 'count' | 'avg' | 'sum'
    >(
        (initialConfig?.aggregationMode || getMetricType(selectedSeries)) ===
            'counter'
            ? 'count'
            : 'avg',
    );

    const {
        data: { labels: currentAvailableLabels },
    } = useImpactMetricsData(
        selectedSeries
            ? {
                  series: selectedSeries,
                  range: selectedRange,
                  aggregationMode,
              }
            : undefined,
    );

    useEffect(() => {
        if (open && initialConfig) {
            setTitle(initialConfig.title || '');
            setSelectedSeries(initialConfig.selectedSeries);
            setSelectedRange(initialConfig.selectedRange);
            setBeginAtZero(initialConfig.beginAtZero);
            setSelectedLabels(initialConfig.selectedLabels);
            setAggregationMode(
                initialConfig.aggregationMode ||
                    (initialConfig.selectedSeries.startsWith('unleash_counter_')
                        ? 'count'
                        : 'avg'),
            );
        } else if (open && !initialConfig) {
            setTitle('');
            setSelectedSeries('');
            setSelectedRange('day');
            setBeginAtZero(false);
            setSelectedLabels({});
            setAggregationMode('count');
        }
    }, [open, initialConfig]);

    const handleSeriesChange = (series: string) => {
        setSelectedSeries(series);
        setSelectedLabels({});
        // Set default mode based on series type
        if (series.startsWith('unleash_counter_')) {
            setAggregationMode('count');
        } else if (series.startsWith('unleash_gauge_')) {
            setAggregationMode('avg');
        }
    };

    const getConfigToSave = (): Omit<ChartConfig, 'id'> => ({
        title: title || undefined,
        selectedSeries,
        selectedRange,
        beginAtZero,
        selectedLabels,
        aggregationMode,
    });

    const isValid = selectedSeries.length > 0;

    return {
        formData: {
            title,
            selectedSeries,
            selectedRange,
            beginAtZero,
            aggregationMode,
            selectedLabels,
        },
        actions: {
            setTitle,
            setSelectedSeries,
            setSelectedRange,
            setBeginAtZero,
            setAggregationMode,
            setSelectedLabels,
            handleSeriesChange,
            getConfigToSave,
        },
        isValid,
        currentAvailableLabels,
    };
};
