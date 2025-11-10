import { Button } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useImpactMetricsNames } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import {
    RangeSelector,
    type TimeRange,
} from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/RangeSelector/RangeSelector';
import { ModeSelector } from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/ModeSelector/ModeSelector';
import { SeriesSelector } from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/SeriesSelector/SeriesSelector';
import type { AggregationMode } from 'component/impact-metrics/types';
import {
    createStyledIcon,
    StyledButtonGroup,
    StyledFormContainer,
    StyledLabel,
    StyledMenuItem,
    StyledSelect,
    StyledTextField,
    StyledTopRow,
} from '../shared/SharedFormComponents.tsx';

const StyledIcon = createStyledIcon(ShieldIcon);

interface ISafeguardFormProps {
    onSubmit: (data: {
        impactMetric: {
            metricName: string;
            timeRange: TimeRange;
            aggregationMode: AggregationMode;
            labelSelectors: {
                appName: string[];
            };
        };
        operator: string;
        threshold: number;
    }) => void;
    onCancel: () => void;
}

export const SafeguardForm = ({ onSubmit, onCancel }: ISafeguardFormProps) => {
    const { metricSeries, loading } = useImpactMetricsNames();

    const [selectedMetric, setSelectedMetric] = useState('');
    const [application, setApplication] = useState('*');
    const [aggregationMode, setAggregationMode] =
        useState<AggregationMode>('rps');
    const [operator, setOperator] = useState('>');
    const [threshold, setThreshold] = useState(0);
    const [timeRange, setTimeRange] = useState<TimeRange>('day');

    const { data: metricsData } = useImpactMetricsData(
        selectedMetric
            ? {
                  series: selectedMetric,
                  range: timeRange,
                  aggregationMode: aggregationMode,
              }
            : undefined,
    );

    const applicationNames = useMemo(() => {
        const appNames = metricsData?.labels?.appName || [];
        return ['*', ...appNames];
    }, [metricsData?.labels?.appName]);

    useEffect(() => {
        if (metricSeries.length > 0 && !selectedMetric) {
            setSelectedMetric(metricSeries[0].name);
        }
    }, [metricSeries, selectedMetric]);

    const selectedMetricData = metricSeries.find(
        (m) => m.name === selectedMetric,
    );
    const metricType = selectedMetricData?.type || 'unknown';

    const handleMetricChange = (metricName: string) => {
        setSelectedMetric(metricName);
        setApplication('*');

        const metric = metricSeries.find((m) => m.name === metricName);
        const type = metric?.type || 'unknown';

        if (type === 'counter') {
            setAggregationMode('count');
        } else if (type === 'gauge') {
            setAggregationMode('avg');
        } else if (type === 'histogram') {
            setAggregationMode('p50');
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!Number.isNaN(Number(threshold))) {
            onSubmit({
                impactMetric: {
                    metricName: selectedMetric,
                    timeRange,
                    aggregationMode,
                    labelSelectors: {
                        appName: [application],
                    },
                },
                operator,
                threshold: Number(threshold),
            });
        }
    };

    return (
        <StyledFormContainer onSubmit={handleSubmit}>
            <StyledTopRow>
                <StyledIcon />
                <SeriesSelector
                    value={selectedMetric}
                    onChange={handleMetricChange}
                    options={metricSeries}
                    loading={loading}
                />

                <StyledLabel>filtered by</StyledLabel>
                <StyledSelect
                    value={application}
                    onChange={(e) => setApplication(String(e.target.value))}
                    variant='outlined'
                    size='small'
                >
                    {applicationNames.map((app) => (
                        <StyledMenuItem key={app} value={app}>
                            {app === '*' ? 'All' : app}
                        </StyledMenuItem>
                    ))}
                </StyledSelect>

                <StyledLabel>aggregated by</StyledLabel>
                <ModeSelector
                    value={aggregationMode}
                    onChange={setAggregationMode}
                    metricType={metricType}
                />

                <StyledLabel>is</StyledLabel>
                <StyledSelect
                    value={operator}
                    onChange={(e) => setOperator(String(e.target.value))}
                    variant='outlined'
                    size='small'
                >
                    <StyledMenuItem value='>'>More than</StyledMenuItem>
                    <StyledMenuItem value='<'>Less than</StyledMenuItem>
                </StyledSelect>

                <StyledTextField
                    type='number'
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    placeholder='Value'
                    variant='outlined'
                    size='small'
                    required
                />

                <StyledLabel>over</StyledLabel>
                <RangeSelector value={timeRange} onChange={setTimeRange} />
            </StyledTopRow>
            <StyledButtonGroup>
                <Button variant='outlined' onClick={onCancel} size='small'>
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    size='small'
                    type='submit'
                    disabled={Number.isNaN(Number(threshold))}
                >
                    Save
                </Button>
            </StyledButtonGroup>
        </StyledFormContainer>
    );
};
