import { useState, useEffect } from 'react';
import { useImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsLabels';
import type { AggregationMode, ChartConfig, MetricSource } from '../types.ts';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import type { MetricSelection } from '../ImpactMetricModal/ImpactMetricsControls/SeriesSelector/MetricSelector.tsx';

export type AvailableLabels =
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'ready'; labels: ImpactMetricsLabels };
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
        source?: MetricSource;
    };
    actions: {
        setTitle: (title: string) => void;
        setMetricName: (series: string) => void;
        setTimeRange: (range: 'hour' | 'day' | 'week' | 'month') => void;
        setYAxisMin: (yAxisMin: 'auto' | 'zero') => void;
        setAggregationMode: (mode: AggregationMode) => void;
        setLabelSelectors: (labels: Record<string, string[]>) => void;
        handleSeriesChange: (selection: MetricSelection) => void;
        getConfigToSave: () => Omit<ChartConfig, 'id'>;
    };
    isValid: boolean;
    currentAvailableLabels: AvailableLabels;
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
    >(initialConfig?.timeRange || 'hour');
    const [yAxisMin, setYAxisMin] = useState(initialConfig?.yAxisMin || 'auto');
    const [labelSelectors, setLabelSelectors] = useState<
        Record<string, string[]>
    >(initialConfig?.labelSelectors || {});
    const [aggregationMode, setAggregationMode] = useState<AggregationMode>(
        initialConfig?.aggregationMode ||
            getDefaultAggregation(getMetricType(metricName)),
    );
    const [source, setSource] = useState<MetricSource | undefined>(
        initialConfig?.source,
    );

    const {
        labels: fetchedLabels,
        loading: fetchingLabels,
        error: labelsFetchError,
    } = useImpactMetricsLabels(
        // the modal stays mounted while closed; only fetch while it is open
        open ? metricName : '',
        source,
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
            setTimeRange('hour');
            setYAxisMin('auto');
            setLabelSelectors({});
            setAggregationMode('count');
            setSource(undefined);
        }
    }, [open, initialConfig]);

    const handleSeriesChange = (selection: MetricSelection) => {
        setMetricName(selection.metricName);
        setSource(selection.source);
        setLabelSelectors({});
        const metricType = getMetricType(selection.metricName);
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
    const metricType = getMetricType(metricName, fetchedLabels?.metric_type);
    const hasFetchedLabels = Object.keys(fetchedLabels).length > 0;
    const currentAvailableLabels: AvailableLabels =
        labelsFetchError && !hasFetchedLabels
            ? { status: 'error' }
            : fetchingLabels
              ? { status: 'loading' }
              : { status: 'ready', labels: fetchedLabels };

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
