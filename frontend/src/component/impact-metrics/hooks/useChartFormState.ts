import { useState, useEffect } from 'react';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import type { AggregationMode, ChartConfig } from '../types.ts';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import {
    getDefaultAggregation,
    getMetricType,
    type MetricType,
} from '../metricsFormatters.ts';

type UseChartConfigParams = {
    open: boolean;
    initialConfig?: ChartConfig;
};

export type ChartFormState = {
    formData: {
        title: string;
        metricName: string;
        metricType: MetricType;
        timeRange: 'hour' | 'day' | 'week' | 'month';
        yAxisMin: 'auto' | 'zero';
        aggregationMode: AggregationMode;
        labelSelectors: Record<string, string[]>;
        source?: 'internal' | 'external';
    };
    actions: {
        setTitle: (title: string) => void;
        setMetricName: (series: string) => void;
        setTimeRange: (range: 'hour' | 'day' | 'week' | 'month') => void;
        setYAxisMin: (yAxisMin: 'auto' | 'zero') => void;
        setAggregationMode: (mode: AggregationMode) => void;
        setLabelSelectors: (labels: Record<string, string[]>) => void;
        handleSeriesChange: (series: string, option?: { source?: 'internal' | 'external' }) => void;
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
        initialConfig?.aggregationMode ||
            getDefaultAggregation(getMetricType(metricName)),
    );
    const [source, setSource] = useState<'internal' | 'external' | undefined>(
        initialConfig?.source,
    );

    const {
        data: { labels: currentAvailableLabels },
    } = useImpactMetricsData(
        metricName
            ? {
                  series: metricName,
                  range: timeRange,
                  aggregationMode,
                  source,
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
                    getDefaultAggregation(
                        getMetricType(initialConfig.metricName),
                    ),
            );
            setSource(initialConfig.source);
        } else if (open && !initialConfig) {
            setTitle('');
            setMetricName('');
            setTimeRange('day');
            setYAxisMin('auto');
            setLabelSelectors({});
            setAggregationMode('count');
            setSource(undefined);
        }
    }, [open, initialConfig]);

    const handleSeriesChange = (series: string, option?: { source?: 'internal' | 'external' }) => {
        setMetricName(series);
        setSource(option?.source);
        setLabelSelectors({});
        const metricType = getMetricType(series);
        if (metricType !== 'unknown') {
            setAggregationMode(getDefaultAggregation(metricType));
        }
    };

    const getConfigToSave = (): Omit<ChartConfig, 'id'> => ({
        title: title || undefined,
        metricName,
        timeRange,
        yAxisMin,
        labelSelectors,
        aggregationMode,
        source,
    });

    const isValid = metricName.length > 0;
    const metricType = getMetricType(
        metricName,
        currentAvailableLabels?.metric_type,
    );

    useEffect(() => {
        if (
            metricName !== initialConfig?.metricName &&
            metricType !== 'unknown'
        ) {
            setAggregationMode(getDefaultAggregation(metricType));
        }
    }, [metricName, metricType]);

    return {
        formData: {
            title,
            metricName,
            metricType,
            timeRange,
            yAxisMin,
            aggregationMode,
            labelSelectors,
            source,
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
