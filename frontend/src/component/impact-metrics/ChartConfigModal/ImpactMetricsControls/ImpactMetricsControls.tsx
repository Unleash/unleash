import type { FC, ReactNode } from 'react';
import { Box, FormControlLabel, Checkbox, MenuItem } from '@mui/material';
import type { ImpactMetricsSeries } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { MetricSelector } from './SeriesSelector/MetricSelector.tsx';
import { RangeSelector } from './RangeSelector/RangeSelector.tsx';
import { ModeSelector } from './ModeSelector/ModeSelector.tsx';
import type { ChartFormState } from '../../hooks/useChartFormState.ts';
import type { MetricType } from '../../metricsFormatters.ts';

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
    metricType: MetricType;
    loading?: boolean;
    labelsFilter?: ReactNode;
};

export const ImpactMetricsControls: FC<ImpactMetricsControlsProps> = ({
    formData,
    actions,
    metricSeries,
    metricType,
    loading,
    labelsFilter,
}) => (
    <Box>
        <Box
            sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing(3),
            })}
        >
            <MetricSelector
                value={formData.metricName}
                onChange={actions.handleSeriesChange}
                options={metricSeries}
                loading={loading}
            />

            {labelsFilter}

            {formData.metricName ? (
                <>
                    <RangeSelector
                        value={formData.timeRange}
                        onChange={actions.setTimeRange}
                    >
                        <MenuItem value='hour'>Last hour</MenuItem>
                        <MenuItem value='day'>Last 24 hours</MenuItem>
                        <MenuItem value='week'>Last 7 days</MenuItem>
                        <MenuItem value='month'>Last 30 days</MenuItem>
                    </RangeSelector>
                    <ModeSelector
                        value={formData.aggregationMode}
                        onChange={actions.setAggregationMode}
                        metricType={metricType}
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
