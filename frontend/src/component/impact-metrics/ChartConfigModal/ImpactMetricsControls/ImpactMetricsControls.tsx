import type { FC } from 'react';
import { Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { MetricSelector } from './SeriesSelector/MetricSelector.tsx';
import { RangeSelector } from './RangeSelector/RangeSelector.tsx';
import { ModeSelector } from './ModeSelector/ModeSelector.tsx';
import type { ChartFormState } from '../../hooks/useChartFormState.ts';
import { getMetricType } from '../../metricsFormatters.ts';

export type ImpactMetricsControlsProps = {
    formData: ChartFormState['formData'];
    actions: Pick<
        ChartFormState['actions'],
        | 'handleSeriesChange'
        | 'setTimeRange'
        | 'setYAxisMin'
        | 'setLabelSelectors'
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

            <MetricSelector
                value={formData.metricName}
                onChange={actions.handleSeriesChange}
                options={metricSeries}
                loading={loading}
            />

            {formData.metricName ? (
                <>
                    <RangeSelector
                        value={formData.timeRange}
                        onChange={actions.setTimeRange}
                    />
                    <ModeSelector
                        value={formData.aggregationMode}
                        onChange={actions.setAggregationMode}
                        metricType={getMetricType(formData.metricName)!}
                    />
                </>
            ) : null}
        </Box>
        {formData.metricName ? (
            <FormControlLabel
                sx={(theme) => ({ margin: theme.spacing(1.5, 0) })}
                control={
                    <Checkbox
                        checked={formData.yAxisMin === 'zero'}
                        onChange={(e) =>
                            actions.setYAxisMin(
                                e.target.checked ? 'zero' : 'auto',
                            )
                        }
                    />
                }
                label='Begin at zero'
            />
        ) : null}
    </Box>
);
