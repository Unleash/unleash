import type { FC } from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { SeriesSelector } from './SeriesSelector/SeriesSelector.tsx';
import { RangeSelector } from './RangeSelector/RangeSelector.tsx';
import { ModeSelector } from './ModeSelector/ModeSelector.tsx';
import type { ChartFormState } from '../../hooks/useChartFormState.ts';
import { getMetricType } from '../../utils.ts';

export type ImpactMetricsControlsProps = {
    formData: ChartFormState['formData'];
    actions: Pick<
        ChartFormState['actions'],
        | 'handleSeriesChange'
        | 'setSelectedRange'
        | 'setBeginAtZero'
        | 'setSelectedLabels'
        | 'setAggregationMode'
    >;
    metricSeries: (ImpactMetricsSeries & { name: string })[];
    loading?: boolean;
};

export const ImpactMetricsControls: FC<ImpactMetricsControlsProps> = ({
    formData,
    actions,
    metricSeries,
    loading,
}) => (
    <Box>
        <Box
            sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(3),
            })}
        >
            <Typography variant='body2' color='text.secondary'>
                Select a custom metric to see its value over time. This can help
                you understand the impact of your feature rollout on key
                outcomes, such as system performance, usage patterns or error
                rates.
            </Typography>

            <SeriesSelector
                value={formData.selectedSeries}
                onChange={actions.handleSeriesChange}
                options={metricSeries}
                loading={loading}
            />

            {formData.selectedSeries ? (
                <>
                    <RangeSelector
                        value={formData.selectedRange}
                        onChange={actions.setSelectedRange}
                    />
                    <ModeSelector
                        value={formData.aggregationMode}
                        onChange={actions.setAggregationMode}
                        seriesType={getMetricType(formData.selectedSeries)!}
                    />
                </>
            ) : null}
        </Box>
        {formData.selectedSeries ? (
            <FormControlLabel
                sx={(theme) => ({ margin: theme.spacing(1.5, 0) })}
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
        ) : null}
    </Box>
);
