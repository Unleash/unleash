import { Button, FormControl, IconButton, TextField } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { SafeguardChangeRequestDialog } from './SafeguardChangeRequestDialog.tsx';
import { useImpactMetricsOptions } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { RangeSelector } from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/RangeSelector/RangeSelector';
import { ModeSelector } from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/ModeSelector/ModeSelector';
import { MetricSelector } from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/SeriesSelector/MetricSelector.tsx';
import type { CreateSafeguardSchema } from 'openapi/models/createSafeguardSchema';
import type { MetricQuerySchemaTimeRange } from 'openapi/models/metricQuerySchemaTimeRange';
import type { MetricQuerySchemaAggregationMode } from 'openapi/models/metricQuerySchemaAggregationMode';
import type { SafeguardTriggerConditionSchemaOperator } from 'openapi/models/safeguardTriggerConditionSchemaOperator';
import {
    createStyledIcon,
    type FormMode,
    StyledButtonGroup,
    StyledFormContainer,
    StyledLabel,
    StyledMenuItem,
    StyledSelect,
    StyledTopRow,
} from '../shared/SharedFormComponents.tsx';
import type { ISafeguard } from 'interfaces/releasePlans.ts';
import { UPDATE_FEATURE_STRATEGY } from 'component/providers/AccessProvider/permissions.ts';
import PermissionButton from 'component/common/PermissionButton/PermissionButton.tsx';

const StyledIcon = createStyledIcon(ShieldIcon);

export const useSafeguardForm = (safeguards: ISafeguard[] | undefined) => {
    const [safeguardFormOpen, setSafeguardFormOpen] = useState(false);

    useEffect(() => {
        if (safeguards && safeguards.length > 0) {
            setSafeguardFormOpen(true);
        } else {
            setSafeguardFormOpen(false);
        }
    }, [JSON.stringify(safeguards)]);

    return { safeguardFormOpen, setSafeguardFormOpen };
};

interface ISafeguardFormProps {
    onSubmit: (data: CreateSafeguardSchema) => void;
    onCancel?: () => void;
    onDelete?: () => void;
    safeguard?: ISafeguard;
    environment: string;
}

const getInitialValues = (safeguard?: ISafeguard) => ({
    metricName: safeguard?.impactMetric.metricName || '',
    appName: safeguard?.impactMetric.labelSelectors.appName?.[0] || '*',
    aggregationMode: (safeguard?.impactMetric.aggregationMode ||
        'rps') as MetricQuerySchemaAggregationMode,
    operator: (safeguard?.triggerCondition?.operator ||
        '>') as SafeguardTriggerConditionSchemaOperator,
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
    environment,
}: ISafeguardFormProps) => {
    const { metricOptions, loading } = useImpactMetricsOptions();
    const projectId = useRequiredPathParam('projectId');
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);
    const [dialogOpen, setDialogOpen] = useState(false);

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
    const [operator, setOperator] =
        useState<SafeguardTriggerConditionSchemaOperator>(
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

    const handleOperatorChange = (
        value: SafeguardTriggerConditionSchemaOperator,
    ) => {
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

    const buildSafeguardData = (): CreateSafeguardSchema => ({
        impactMetric: {
            metricName,
            timeRange,
            aggregationMode,
            labelSelectors: {
                appName: [appName],
            },
        },
        triggerCondition: {
            operator,
            threshold: Number(threshold),
        },
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (Number.isNaN(Number(threshold))) {
            return;
        }

        if (isChangeRequestConfigured(environment)) {
            setDialogOpen(true);
            return;
        }

        onSubmit(buildSafeguardData());

        if (mode === 'edit' || mode === 'create') {
            setMode('display');
        }
    };

    const handleDialogConfirm = () => {
        const safeguardData = buildSafeguardData();
        setDialogOpen(false);
        onSubmit(safeguardData);
        if (mode === 'edit' || mode === 'create') {
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
            onCancel?.();
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
        <StyledFormContainer onSubmit={handleSubmit} mode={mode}>
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
            <StyledTopRow sx={{ ml: 3 }}>
                <MetricSelector
                    value={metricName}
                    onChange={handleMetricChange}
                    options={metricOptions}
                    loading={loading}
                    label=''
                />

                <StyledTopRow>
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
                </StyledTopRow>

                <StyledTopRow>
                    <StyledLabel>aggregated by</StyledLabel>
                    <ModeSelector
                        value={aggregationMode}
                        onChange={handleAggregationModeChange}
                        metricType={metricType}
                        label=''
                    />
                </StyledTopRow>
            </StyledTopRow>
            <StyledTopRow sx={{ ml: 0.75 }}>
                <StyledTopRow>
                    <StyledLabel>is</StyledLabel>
                    <FormControl variant='outlined' size='small'>
                        <StyledSelect
                            value={operator}
                            onChange={(e) =>
                                handleOperatorChange(
                                    e.target
                                        .value as SafeguardTriggerConditionSchemaOperator,
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
                </StyledTopRow>

                <StyledTopRow>
                    <StyledLabel>over</StyledLabel>
                    <RangeSelector
                        value={timeRange}
                        onChange={handleTimeRangeChange}
                        label=''
                    />
                </StyledTopRow>
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
                    <PermissionButton
                        permission={UPDATE_FEATURE_STRATEGY}
                        variant='contained'
                        color='primary'
                        size='small'
                        type='submit'
                        disabled={Number.isNaN(Number(threshold))}
                    >
                        Save
                    </PermissionButton>
                </StyledButtonGroup>
            )}
            <SafeguardChangeRequestDialog
                isOpen={dialogOpen}
                onConfirm={handleDialogConfirm}
                onClose={() => setDialogOpen(false)}
                safeguardData={buildSafeguardData()}
                environment={environment}
                mode={mode === 'edit' ? 'edit' : 'create'}
            />
        </StyledFormContainer>
    );
};
