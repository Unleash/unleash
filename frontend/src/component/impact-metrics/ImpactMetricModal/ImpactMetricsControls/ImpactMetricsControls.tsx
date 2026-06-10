import type { FC, ReactNode } from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';
import type { ImpactMetric } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { MetricSelector } from './SeriesSelector/MetricSelector.tsx';
import { getAggregationModeOptions } from './ModeSelector/ModeSelector.tsx';
import type { TimeRange } from './RangeSelector/RangeSelector.tsx';
import type { ChartFormState } from '../../hooks/useChartFormState.ts';
import type { AggregationMode } from '../../types.ts';
import { FormField } from 'component/common/FormField/FormField';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { useLocation } from 'react-router-dom';

const timeRangeOptions = [
    { key: 'hour', label: 'Last hour' },
    { key: 'day', label: 'Last 24 hours' },
    { key: 'week', label: 'Last 7 days' },
    { key: 'month', label: 'Last 30 days' },
];

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
        <>
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
                    <FormField label='Time'>
                        <GeneralSelect
                            value={formData.timeRange}
                            onChange={(value) =>
                                actions.setTimeRange(value as TimeRange)
                            }
                            options={timeRangeOptions}
                            fullWidth
                        />
                    </FormField>
                    <FormField label='Aggregation mode'>
                        <GeneralSelect
                            value={formData.aggregationMode}
                            onChange={(value) =>
                                actions.setAggregationMode(
                                    value as AggregationMode,
                                )
                            }
                            options={getAggregationModeOptions(
                                formData.metricType,
                            )}
                            fullWidth
                        />
                    </FormField>
                    <FormControlLabel
                        sx={(theme) => ({ margin: theme.spacing(0.5, 0) })}
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
                </>
            ) : null}
        </>
    );
};
