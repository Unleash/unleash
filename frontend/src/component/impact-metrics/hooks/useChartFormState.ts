import { useState, useEffect } from 'react';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import type { ChartConfig } from '../types.ts';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';

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
        showRate: boolean;
        selectedLabels: Record<string, string[]>;
    };
    actions: {
        setTitle: (title: string) => void;
        setSelectedSeries: (series: string) => void;
        setSelectedRange: (range: 'hour' | 'day' | 'week' | 'month') => void;
        setBeginAtZero: (beginAtZero: boolean) => void;
        setShowRate: (showRate: boolean) => void;
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
    const [showRate, setShowRate] = useState(initialConfig?.showRate || false);

    const {
        data: { labels: currentAvailableLabels },
    } = useImpactMetricsData(
        selectedSeries
            ? {
                  series: selectedSeries,
                  range: selectedRange,
                  showRate,
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
            setShowRate(initialConfig.showRate || false);
        } else if (open && !initialConfig) {
            setTitle('');
            setSelectedSeries('');
            setSelectedRange('day');
            setBeginAtZero(false);
            setSelectedLabels({});
            setShowRate(false);
        }
    }, [open, initialConfig]);

    const handleSeriesChange = (series: string) => {
        setSelectedSeries(series);
        setSelectedLabels({});
    };

    const getConfigToSave = (): Omit<ChartConfig, 'id'> => ({
        title: title || undefined,
        selectedSeries,
        selectedRange,
        beginAtZero,
        selectedLabels,
        showRate,
    });

    const isValid = selectedSeries.length > 0;

    return {
        formData: {
            title,
            selectedSeries,
            selectedRange,
            beginAtZero,
            showRate,
            selectedLabels,
        },
        actions: {
            setTitle,
            setSelectedSeries,
            setSelectedRange,
            setBeginAtZero,
            setShowRate,
            setSelectedLabels,
            handleSeriesChange,
            getConfigToSave,
        },
        isValid,
        currentAvailableLabels,
    };
};
