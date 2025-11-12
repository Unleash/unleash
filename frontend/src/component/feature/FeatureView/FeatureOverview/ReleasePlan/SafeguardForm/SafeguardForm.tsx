import { Button } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useImpactMetricsOptions } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { RangeSelector } from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/RangeSelector/RangeSelector';
import { ModeSelector } from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/ModeSelector/ModeSelector';
import { MetricSelector } from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/SeriesSelector/MetricSelector.tsx';
import type { CreateSafeguardSchema } from 'openapi/models/createSafeguardSchema';
import type { MetricQuerySchemaTimeRange } from 'openapi/models/metricQuerySchemaTimeRange';
import type { MetricQuerySchemaAggregationMode } from 'openapi/models/metricQuerySchemaAggregationMode';
import type { CreateSafeguardSchemaOperator } from 'openapi/models/createSafeguardSchemaOperator';
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
import type { ISafeguard } from 'interfaces/releasePlans.ts';

const StyledIcon = createStyledIcon(ShieldIcon);

interface ISafeguardFormProps {
    onSubmit: (data: CreateSafeguardSchema) => void;
    onCancel: () => void;
    safeguard?: ISafeguard;
}

export const SafeguardForm = ({
    onSubmit,
    onCancel,
    safeguard,
}: ISafeguardFormProps) => {
    const { metricOptions, loading } = useImpactMetricsOptions();

    const [selectedMetric, setSelectedMetric] = useState(
        safeguard?.impactMetric.metricName || '',
    );
    const [application, setApplication] = useState(
        safeguard?.impactMetric.labelSelectors.appName[0] || '*',
    );
    const [aggregationMode, setAggregationMode] =
        useState<MetricQuerySchemaAggregationMode>(
            safeguard?.impactMetric.aggregationMode || 'rps',
        );
    const [operator, setOperator] = useState<CreateSafeguardSchemaOperator>(
        safeguard?.triggerCondition.operator || '>',
    );
    const [threshold, setThreshold] = useState(
        safeguard?.triggerCondition?.threshold || 0,
    );
    const [timeRange, setTimeRange] = useState<MetricQuerySchemaTimeRange>(
        safeguard?.impactMetric.timeRange || 'day',
    );

    type FormMode = 'create' | 'edit' | 'display';
    const [mode, setMode] = useState<FormMode>(
        safeguard ? 'display' : 'create',
    );

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
        if (metricOptions.length > 0 && !selectedMetric) {
            setSelectedMetric(metricOptions[0].name);
        }
    }, [metricOptions, selectedMetric]);

    const selectedMetricData = metricOptions.find(
        (m) => m.name === selectedMetric,
    );
    const metricType = selectedMetricData?.type || 'unknown';

    const enterEditMode = () => {
        if (mode === 'display') {
            setMode('edit');
        }
    };

    const handleMetricChange = (metricName: string) => {
        enterEditMode();
        setSelectedMetric(metricName);
        setApplication('*');

        const metric = metricOptions.find((m) => m.name === metricName);
        const type = metric?.type || 'unknown';

        if (type === 'counter') {
            setAggregationMode('count');
        } else if (type === 'gauge') {
            setAggregationMode('avg');
        } else if (type === 'histogram') {
            setAggregationMode('p50');
        }
    };

    const handleApplicationChange = (value: string) => {
        enterEditMode();
        setApplication(value);
    };

    const handleAggregationModeChange = (
        value: MetricQuerySchemaAggregationMode,
    ) => {
        enterEditMode();
        setAggregationMode(value);
    };

    const handleOperatorChange = (value: CreateSafeguardSchemaOperator) => {
        enterEditMode();
        setOperator(value);
    };

    const handleThresholdChange = (value: number) => {
        enterEditMode();
        setThreshold(value);
    };

    const handleTimeRangeChange = (value: MetricQuerySchemaTimeRange) => {
        enterEditMode();
        setTimeRange(value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!Number.isNaN(Number(threshold))) {
            const data: CreateSafeguardSchema = {
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
            };
            onSubmit(data);
            if (mode === 'edit') {
                setMode('display');
            }
        }
    };

    const resetToOriginalValues = () => {
        if (!safeguard) return;

        setSelectedMetric(safeguard.impactMetric.metricName);
        setApplication(safeguard.impactMetric.labelSelectors.appName[0]);
        setAggregationMode(safeguard.impactMetric.aggregationMode);
        setOperator(safeguard.triggerCondition.operator);
        setThreshold(safeguard.triggerCondition.threshold);
        setTimeRange(safeguard.impactMetric.timeRange);
    };

    const handleCancel = () => {
        if (mode === 'create') {
            onCancel();
            return;
        }

        resetToOriginalValues();
        setMode('display');
    };

    const showButtons = mode === 'create' || mode === 'edit';

    return (
        <StyledFormContainer onSubmit={handleSubmit}>
            <StyledTopRow>
                <StyledIcon />
                <MetricSelector
                    value={selectedMetric}
                    onChange={handleMetricChange}
                    options={metricOptions}
                    loading={loading}
                />

                <StyledLabel>filtered by</StyledLabel>
                <StyledSelect
                    value={application}
                    onChange={(e) =>
                        handleApplicationChange(String(e.target.value))
                    }
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
                    onChange={handleAggregationModeChange}
                    metricType={metricType}
                />

                <StyledLabel>is</StyledLabel>
                <StyledSelect
                    value={operator}
                    onChange={(e) =>
                        handleOperatorChange(
                            e.target.value as CreateSafeguardSchemaOperator,
                        )
                    }
                    variant='outlined'
                    size='small'
                >
                    <StyledMenuItem value='>'>More than</StyledMenuItem>
                    <StyledMenuItem value='<'>Less than</StyledMenuItem>
                </StyledSelect>

                <StyledTextField
                    type='number'
                    value={threshold}
                    onChange={(e) =>
                        handleThresholdChange(Number(e.target.value))
                    }
                    placeholder='Value'
                    variant='outlined'
                    size='small'
                    required
                />

                <StyledLabel>over</StyledLabel>
                <RangeSelector
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                />
            </StyledTopRow>
            {showButtons && (
                <StyledButtonGroup>
                    <Button
                        variant='outlined'
                        onClick={handleCancel}
                        size='small'
                    >
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
            )}
        </StyledFormContainer>
    );
};
