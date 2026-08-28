import type { FC, ReactNode } from 'react';
import { Box, FormControlLabel, Checkbox } from '@mui/material';
import type { ImpactMetric } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { MetricSelector } from './SeriesSelector/MetricSelector.tsx';
import { RangeSelector } from './RangeSelector/RangeSelector.tsx';
import { ModeSelector } from './ModeSelector/ModeSelector.tsx';
import type { ChartFormState } from '../../hooks/useChartFormState.ts';
import { useLocation } from 'react-router';

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
    metrics: ImpactMetric[];
    loading?: boolean;
    labelsFilter?: ReactNode;
};

export const ImpactMetricsControls: FC<ImpactMetricsControlsProps> = ({
    formData,
    actions,
    metrics,
    loading,
    labelsFilter,
}) => {
    const { pathname } = useLocation();
    const entryPoint = pathname.includes('/impact-metrics')
        ? 'impact-metrics-page'
        : 'flag-impact-metrics-accordion';

    return (
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
                    valueSource={formData.source}
                    onChange={actions.handleSeriesChange}
                    options={metrics}
                    loading={loading}
                    entryPoint={entryPoint}
                />

                {labelsFilter}

                {formData.metricName ? (
                    <>
                        <RangeSelector
                            value={formData.timeRange}
                            onChange={actions.setTimeRange}
                            options={[
                                { key: 'hour', label: 'Last hour' },
                                { key: 'day', label: 'Last 24 hours' },
                                { key: 'week', label: 'Last 7 days' },
                                { key: 'month', label: 'Last 30 days' },
                            ]}
                        />
                        <ModeSelector
                            value={formData.aggregationMode}
                            onChange={actions.setAggregationMode}
                            metricType={formData.metricType}
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
};
