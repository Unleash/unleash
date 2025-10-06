import { useState, useEffect } from 'react';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import type { AggregationMode, ChartConfig } from '../types.ts';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { getDefaultAggregation, getMetricType } from '../metricsFormatters.ts';

type UseChartConfigParams = {
    open: boolean;
    initialConfig?: ChartConfig;
};

export type ChartFormState = {
    formData: {
        title: string;
        metricName: string;
        timeRange: 'hour' | 'day' | 'week' | 'month';
        yAxisMin: 'auto' | 'zero';
        aggregationMode: AggregationMode;
        labelSelectors: Record<string, string[]>;
    };
    actions: {
        setTitle: (title: string) => void;
        setMetricName: (series: string) => void;
        setTimeRange: (range: 'hour' | 'day' | 'week' | 'month') => void;
        setYAxisMin: (yAxisMin: 'auto' | 'zero') => void;
        setAggregationMode: (mode: AggregationMode) => void;
        setLabelSelectors: (labels: Record<string, string[]>) => void;
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
    const [metricName, setMetricName] = useState(
        initialConfig?.metricName || '',
    );
    const [timeRange, setTimeRange] = useState<
        'hour' | 'day' | 'week' | 'month'
    >(initialConfig?.timeRange || 'day');
    const [yAxisMin, setYAxisMin] = useState(initialConfig?.yAxisMin || 'auto');
    const [labelSelectors, setLabelSelectors] = useState<
        Record<string, string[]>
    >(initialConfig?.labelSelectors || {});
    const [aggregationMode, setAggregationMode] = useState<AggregationMode>(
        initialConfig?.aggregationMode || getDefaultAggregation(metricName),
    );

    const {
        data: { labels: currentAvailableLabels },
    } = useImpactMetricsData(
        metricName
            ? {
                  series: metricName,
                  range: timeRange,
                  aggregationMode,
              }
            : undefined,
    );

    useEffect(() => {
        if (open && initialConfig) {
            setTitle(initialConfig.title || '');
            setMetricName(initialConfig.metricName);
            setTimeRange(initialConfig.timeRange);
            setYAxisMin(initialConfig.yAxisMin);
            setLabelSelectors(initialConfig.labelSelectors);
            setAggregationMode(
                initialConfig.aggregationMode ||
                    getDefaultAggregation(initialConfig.metricName),
            );
        } else if (open && !initialConfig) {
            setTitle('');
            setMetricName('');
            setTimeRange('day');
            setYAxisMin('auto');
            setLabelSelectors({});
            setAggregationMode('count');
        }
    }, [open, initialConfig]);

    const handleSeriesChange = (series: string) => {
        setMetricName(series);
        setLabelSelectors({});
        const metric = getMetricType(series);
        if (metric === 'counter') {
            setAggregationMode('count');
        } else if (metric === 'gauge') {
            setAggregationMode('avg');
        } else if (metric === 'histogram') {
            setAggregationMode('p50');
        }
    };

    const getConfigToSave = (): Omit<ChartConfig, 'id'> => ({
        title: title || undefined,
        metricName,
        timeRange,
        yAxisMin,
        labelSelectors,
        aggregationMode,
    });

    const isValid = metricName.length > 0;

    return {
        formData: {
            title,
            metricName,
            timeRange,
            yAxisMin,
            aggregationMode,
            labelSelectors,
        },
        actions: {
            setTitle,
            setMetricName,
            setTimeRange,
            setYAxisMin,
            setAggregationMode,
            setLabelSelectors,
            handleSeriesChange,
            getConfigToSave,
        },
        isValid,
        currentAvailableLabels,
    };
};
