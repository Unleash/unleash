import { useState, useEffect } from 'react';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import type { AggregationMode, ChartConfig, MetricType } from '../types.ts';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { getDefaultAggregation, getMetricType } from '../metricsFormatters.ts';

type UseChartConfigParams = {
    open: boolean;
    initialConfig?: ChartConfig;
    metricSeries?: (ImpactMetricsSeries & { name: string })[];
};

const defaultAggregationForType = (
    type: MetricType,
): AggregationMode | undefined => {
    switch (type) {
        case 'counter':
            return 'count';
        case 'gauge':
            return 'avg';
        case 'histogram':
            return 'p50';
        default:
            return undefined;
    }
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
    };
    actions: {
        setTitle: (title: string) => void;
        setMetricName: (series: string) => void;
        setMetricType: (type: MetricType) => void;
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
    metricSeries,
}: UseChartConfigParams): ChartFormState => {
    const [title, setTitle] = useState(initialConfig?.title || '');
    const [metricName, setMetricName] = useState(
        initialConfig?.metricName || '',
    );
    const [metricType, setMetricTypeState] = useState<MetricType>(
        getMetricType(initialConfig?.metricName || ''),
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
                  metricType:
                      metricType !== 'unknown' ? metricType : undefined,
              }
            : undefined,
    );

    useEffect(() => {
        if (open && initialConfig) {
            setTitle(initialConfig.title || '');
            setMetricName(initialConfig.metricName);
            setMetricTypeState(getMetricType(initialConfig.metricName));
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
            setMetricTypeState('unknown');
            setTimeRange('day');
            setYAxisMin('auto');
            setLabelSelectors({});
            setAggregationMode('count');
        }
    }, [open, initialConfig]);

    const resolveMetricType = (series: string): MetricType => {
        const nameType = getMetricType(series);
        if (nameType !== 'unknown') return nameType;
        const backendType = metricSeries?.find((m) => m.name === series)?.type;
        return backendType || 'unknown';
    };

    const handleSeriesChange = (series: string) => {
        setMetricName(series);
        setLabelSelectors({});
        const type = resolveMetricType(series);
        setMetricTypeState(type);
        const defaultAgg = defaultAggregationForType(type);
        if (defaultAgg) {
            setAggregationMode(defaultAgg);
        }
    };

    const setMetricType = (type: MetricType) => {
        setMetricTypeState(type);
        const defaultAgg = defaultAggregationForType(type);
        if (defaultAgg) {
            setAggregationMode(defaultAgg);
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

    const isValid = metricName.length > 0 && metricType !== 'unknown';

    return {
        formData: {
            title,
            metricName,
            metricType,
            timeRange,
            yAxisMin,
            aggregationMode,
            labelSelectors,
        },
        actions: {
            setTitle,
            setMetricName,
            setMetricType,
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
