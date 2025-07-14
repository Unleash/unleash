import type { FC } from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import type { ImpactMetricsLabels } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { SeriesSelector } from './components/SeriesSelector.tsx';
import { RangeSelector } from './components/RangeSelector.tsx';
import { LabelsFilter } from './components/LabelsFilter.tsx';
import type { ChartFormState } from '../hooks/useChartFormState.ts';

export type ImpactMetricsControlsProps = {
    formData: ChartFormState['formData'];
    actions: Pick<
        ChartFormState['actions'],
        | 'handleSeriesChange'
        | 'setSelectedRange'
        | 'setBeginAtZero'
        | 'setSelectedLabels'
        | 'setShowRate'
    >;
    metricSeries: (ImpactMetricsSeries & { name: string })[];
    loading?: boolean;
    availableLabels?: ImpactMetricsLabels;
};

export const ImpactMetricsControls: FC<ImpactMetricsControlsProps> = ({
    formData,
    actions,
    metricSeries,
    loading,
    availableLabels,
}) => (
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
            value={formData.selectedSeries}
            onChange={actions.handleSeriesChange}
            options={metricSeries}
            loading={loading}
        />

        <RangeSelector
            value={formData.selectedRange}
            onChange={actions.setSelectedRange}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={formData.beginAtZero}
                        onChange={(e) =>
                            actions.setBeginAtZero(e.target.checked)
                        }
                    />
                }
                label='Begin at zero'
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={formData.showRate}
                        onChange={(e) => actions.setShowRate(e.target.checked)}
                    />
                }
                label='Show rate per second'
            />
        </Box>
        {availableLabels && (
            <LabelsFilter
                selectedLabels={formData.selectedLabels}
                onChange={actions.setSelectedLabels}
                availableLabels={availableLabels}
            />
        )}
    </Box>
);
