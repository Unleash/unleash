import type { FC } from 'react';
import { Box, Typography } from '@mui/material';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { SeriesSelector } from './components/SeriesSelector.tsx';
import { RangeSelector, type TimeRange } from './components/RangeSelector.tsx';
import { BeginAtZeroToggle } from './components/BeginAtZeroToggle.tsx';
import { LabelsFilter } from './components/LabelsFilter.tsx';

export type ImpactMetricsControlsProps = {
    selectedSeries: string;
    onSeriesChange: (series: string) => void;
    selectedRange: TimeRange;
    onRangeChange: (range: TimeRange) => void;
    beginAtZero: boolean;
    onBeginAtZeroChange: (beginAtZero: boolean) => void;
    metricSeries: (ImpactMetricsSeries & { name: string })[];
    loading?: boolean;
    selectedLabels: Record<string, string[]>;
    onLabelsChange: (labels: Record<string, string[]>) => void;
    availableLabels?: ImpactMetricsLabels;
};

export const ImpactMetricsControls: FC<ImpactMetricsControlsProps> = (
    props,
) => (
    <Box
        sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(3),
            maxWidth: 400,
        })}
    >
        <Typography variant='body2' color='text.secondary'>
            Select a custom metric to see its value over time. This can help you
            understand the impact of your feature rollout on key outcomes, such
            as system performance, usage patterns or error rates.
        </Typography>

        <SeriesSelector
            value={props.selectedSeries}
            onChange={props.onSeriesChange}
            options={props.metricSeries}
            loading={props.loading}
        />

        <RangeSelector
            value={props.selectedRange}
            onChange={props.onRangeChange}
        />

        <BeginAtZeroToggle
            value={props.beginAtZero}
            onChange={props.onBeginAtZeroChange}
        />

        {props.availableLabels && (
            <LabelsFilter
                selectedLabels={props.selectedLabels}
                onChange={props.onLabelsChange}
                availableLabels={props.availableLabels}
            />
        )}
    </Box>
);
