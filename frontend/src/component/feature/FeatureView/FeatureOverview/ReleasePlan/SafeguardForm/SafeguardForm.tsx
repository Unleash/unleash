import { Button, FormControl, IconButton, TextField } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
    StyledTopRow,
} from '../shared/SharedFormComponents.tsx';
import type { ISafeguard } from 'interfaces/releasePlans.ts';

const StyledIcon = createStyledIcon(ShieldIcon);

interface ISafeguardFormProps {
    onSubmit: (data: CreateSafeguardSchema) => void;
    onCancel: () => void;
    onDelete?: () => void;
    safeguard?: ISafeguard;
}

type FormMode = 'create' | 'edit' | 'display';

const getInitialValues = (safeguard?: ISafeguard) => ({
    metricName: safeguard?.impactMetric.metricName || '',
    appName: safeguard?.impactMetric.labelSelectors.appName?.[0] || '*',
    aggregationMode: (safeguard?.impactMetric.aggregationMode ||
        'rps') as MetricQuerySchemaAggregationMode,
    operator: (safeguard?.triggerCondition.operator ||
        '>') as CreateSafeguardSchemaOperator,
    threshold: safeguard?.triggerCondition?.threshold || 0,
    timeRange: (safeguard?.impactMetric.timeRange ||
        'day') as MetricQuerySchemaTimeRange,
});

const getDefaultAggregationMode = (
    metricType: string,
    fallback: MetricQuerySchemaAggregationMode = 'rps',
): MetricQuerySchemaAggregationMode => {
    switch (metricType) {
        case 'counter':
            return 'count';
        case 'gauge':
            return 'avg';
        case 'histogram':
            return 'p50';
        default:
            return fallback;
    }
};

export const SafeguardForm = ({
    onSubmit,
    onCancel,
    onDelete,
    safeguard,
}: ISafeguardFormProps) => {
    const { metricOptions, loading } = useImpactMetricsOptions();

    const initialValues = useMemo(
        () => getInitialValues(safeguard),
        [safeguard],
    );

    const [metricName, setMetricName] = useState(initialValues.metricName);
    const [appName, setAppName] = useState(initialValues.appName);
    const [aggregationMode, setAggregationMode] =
        useState<MetricQuerySchemaAggregationMode>(
            initialValues.aggregationMode,
        );
    const [operator, setOperator] = useState<CreateSafeguardSchemaOperator>(
        initialValues.operator,
    );
    const [threshold, setThreshold] = useState(initialValues.threshold);
    const [timeRange, setTimeRange] = useState<MetricQuerySchemaTimeRange>(
        initialValues.timeRange,
    );

    const [mode, setMode] = useState<FormMode>(
        safeguard ? 'display' : 'create',
    );

    const { data: metricsData } = useImpactMetricsData(
        metricName
            ? {
                  series: metricName,
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
        if (metricOptions.length > 0 && !metricName) {
            setMetricName(metricOptions[0].name);
        }
    }, [metricOptions, metricName]);

    const selectedMetricData = metricOptions.find((m) => m.name === metricName);
    const metricType = selectedMetricData?.type || 'unknown';

    const enterEditMode = () => {
        if (mode === 'display') {
            setMode('edit');
        }
    };

    const handleMetricChange = (value: string) => {
        enterEditMode();
        setMetricName(value);
        setAppName('*');

        const metric = metricOptions.find((m) => m.name === value);
        if (metric?.type) {
            setAggregationMode(
                getDefaultAggregationMode(metric.type, aggregationMode),
            );
        }
    };

    const handleApplicationChange = (value: string) => {
        enterEditMode();
        setAppName(value);
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

        if (Number.isNaN(Number(threshold))) {
            return;
        }

        onSubmit({
            impactMetric: {
                metricName,
                timeRange,
                aggregationMode,
                labelSelectors: {
                    appName: [appName],
                },
            },
            operator,
            threshold: Number(threshold),
        });

        if (mode === 'edit') {
            setMode('display');
        }
    };

    const resetToOriginalValues = () => {
        if (!safeguard) return;

        setMetricName(initialValues.metricName);
        setAppName(initialValues.appName);
        setAggregationMode(initialValues.aggregationMode);
        setOperator(initialValues.operator);
        setThreshold(initialValues.threshold);
        setTimeRange(initialValues.timeRange);
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

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
        }
    };

    return (
        <StyledFormContainer onSubmit={handleSubmit}>
            <StyledTopRow sx={{ mb: 1 }}>
                <StyledIcon />
                <StyledLabel>Pause automation when</StyledLabel>
                {mode !== 'create' && (
                    <IconButton
                        onClick={handleDelete}
                        size='small'
                        aria-label='Delete safeguard'
                        sx={{ padding: 0.5, marginLeft: 'auto' }}
                    >
                        <DeleteOutlineIcon fontSize='small' />
                    </IconButton>
                )}
            </StyledTopRow>
            <StyledTopRow>
                <MetricSelector
                    value={metricName}
                    onChange={handleMetricChange}
                    options={metricOptions}
                    loading={loading}
                />

                <StyledLabel>filtered by</StyledLabel>
                <FormControl variant='outlined' size='small'>
                    <StyledSelect
                        value={appName}
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
                </FormControl>

                <StyledLabel>aggregated by</StyledLabel>
                <ModeSelector
                    value={aggregationMode}
                    onChange={handleAggregationModeChange}
                    metricType={metricType}
                />
            </StyledTopRow>
            <StyledTopRow>
                <StyledLabel>is</StyledLabel>
                <FormControl variant='outlined' size='small'>
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
                </FormControl>

                <FormControl variant='outlined' size='small'>
                    <TextField
                        type='number'
                        inputProps={{
                            step: 0.1,
                        }}
                        value={threshold}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleThresholdChange(Number(value));
                        }}
                        placeholder='Value'
                        variant='outlined'
                        size='small'
                        required
                    />
                </FormControl>

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
