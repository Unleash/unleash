import { Button, FormControl, TextField, Box, styled } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState, type FC } from 'react';
import { useChangeRequestsEnabled } from 'hooks/useChangeRequestsEnabled';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { SafeguardChangeRequestDialog } from './SafeguardChangeRequestDialog.tsx';
import { MiniMetricsChartWithTooltip } from './MiniMetricsChartWithTooltip.tsx';
import {
    useImpactMetricsOptions,
    type ImpactMetricsSeries,
} from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
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
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton.tsx';

const StyledIcon = createStyledIcon(ShieldIcon);

const SafeguardFormLayout = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const SafeguardConfigurationSection = styled(Box)({
    flex: 1,
    minWidth: 0,
});

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

interface IBaseSafeguardFormProps {
    onSubmit: (data: CreateSafeguardSchema) => void;
    onCancel?: () => void;
    onDelete?: () => void;
    safeguard?: ISafeguard;
    environment: string;
    featureId: string;
    badge?: ReactNode;
}

type MetricOption = { name: string } & ImpactMetricsSeries;

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

const useSafeguardFormValues = (safeguard?: ISafeguard) => {
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

    const resetToOriginalValues = () => {
        if (!safeguard) return;

        setMetricName(initialValues.metricName);
        setAppName(initialValues.appName);
        setAggregationMode(initialValues.aggregationMode);
        setOperator(initialValues.operator);
        setThreshold(initialValues.threshold);
        setTimeRange(initialValues.timeRange);
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

    return {
        metricName,
        setMetricName,
        appName,
        setAppName,
        aggregationMode,
        setAggregationMode,
        operator,
        setOperator,
        threshold,
        setThreshold,
        timeRange,
        setTimeRange,
        resetToOriginalValues,
        buildSafeguardData,
        initialValues,
    };
};

const useSafeguardFormMode = (safeguard?: ISafeguard) => {
    const [mode, setMode] = useState<FormMode>(
        safeguard ? 'display' : 'create',
    );

    const enterEditMode = () => {
        if (mode === 'display') {
            setMode('edit');
        }
    };

    return {
        mode,
        setMode,
        enterEditMode,
    };
};

const useSafeguardMetricsData = (
    metricName: string,
    timeRange: MetricQuerySchemaTimeRange,
    aggregationMode: MetricQuerySchemaAggregationMode,
) => {
    const { metricOptions, loading } = useImpactMetricsOptions();
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

    const selectedMetricData = metricOptions.find((m) => m.name === metricName);
    const metricType = selectedMetricData?.type || 'unknown';

    return {
        metricOptions,
        loading,
        applicationNames,
        metricType,
    };
};

const useSafeguardFormHandlers = (
    formValues: ReturnType<typeof useSafeguardFormValues>,
    formMode: ReturnType<typeof useSafeguardFormMode>,
    metricOptions: MetricOption[],
) => {
    const {
        setMetricName,
        setAppName,
        setAggregationMode,
        setOperator,
        setThreshold,
        setTimeRange,
        aggregationMode,
    } = formValues;
    const { enterEditMode } = formMode;

    // Auto-select first metric when options become available
    useEffect(() => {
        if (metricOptions.length > 0 && !formValues.metricName) {
            setMetricName(metricOptions[0].name);
        }
    }, [metricOptions, formValues.metricName, setMetricName]);

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

    return {
        handleMetricChange,
        handleApplicationChange,
        handleAggregationModeChange,
        handleOperatorChange,
        handleThresholdChange,
        handleTimeRangeChange,
    };
};

const useSafeguardFormState = (
    safeguard: ISafeguard | undefined,
    featureId: string,
) => {
    const projectId = useRequiredPathParam('projectId');
    const formValues = useSafeguardFormValues(safeguard);
    const formMode = useSafeguardFormMode(safeguard);
    const metricsData = useSafeguardMetricsData(
        formValues.metricName,
        formValues.timeRange,
        formValues.aggregationMode,
    );
    const handlers = useSafeguardFormHandlers(
        formValues,
        formMode,
        metricsData.metricOptions,
    );

    return {
        ...formValues,
        ...formMode,
        ...metricsData,
        ...handlers,
        projectId,
        featureId,
        safeguard,
    };
};

interface SafeguardFormBaseProps {
    formState: ReturnType<typeof useSafeguardFormState>;
    onSubmit: (e: FormEvent) => void;
    onCancel?: () => void;
    onDelete?: () => void;
    environment: string;
    badge?: ReactNode;
    children?: React.ReactNode;
}

const SafeguardFormBase: FC<SafeguardFormBaseProps> = ({
    formState,
    onSubmit,
    onCancel,
    onDelete,
    environment,
    badge,
    children,
}) => {
    const {
        metricName,
        appName,
        aggregationMode,
        operator,
        threshold,
        timeRange,
        mode,
        setMode,
        metricOptions,
        loading,
        applicationNames,
        metricType,
        projectId,
        featureId,
        handleMetricChange,
        handleApplicationChange,
        handleAggregationModeChange,
        handleOperatorChange,
        handleThresholdChange,
        handleTimeRangeChange,
        resetToOriginalValues,
    } = formState;

    const handleCancel = () => {
        if (mode === 'create') {
            onCancel?.();
            return;
        }

        resetToOriginalValues();
        setMode('display');
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
        }
    };

    const showButtons = mode === 'create' || mode === 'edit';

    const labelSelectors = useMemo((): Record<string, string[]> => {
        const selectors: Record<string, string[]> = {
            environment: [environment],
        };

        if (appName !== '*') {
            selectors.appName = [appName];
        }

        return selectors;
    }, [appName, environment]);

    const miniChartMetricDisplayName = metricOptions.find(
        (m) => m.name === metricName,
    )?.displayName;

    return (
        <StyledFormContainer onSubmit={onSubmit} mode={mode}>
            <StyledTopRow>
                <StyledIcon />
                <StyledLabel sx={{ mr: 'auto' }}>
                    Pause automation when
                </StyledLabel>
                {mode === 'display' && badge}
                {metricName && (
                    <MiniMetricsChartWithTooltip
                        metricName={metricName}
                        metricDisplayName={miniChartMetricDisplayName}
                        timeRange={timeRange}
                        labelSelectors={labelSelectors}
                        aggregationMode={aggregationMode}
                        threshold={threshold}
                        projectId={projectId}
                        featureId={featureId}
                    />
                )}
                {mode !== 'create' && onDelete && (
                    <PermissionIconButton
                        permission={UPDATE_FEATURE_STRATEGY}
                        projectId={projectId}
                        environmentId={environment}
                        onClick={handleDelete}
                        size='small'
                        aria-label='Delete safeguard'
                        sx={{ padding: 0.5 }}
                    >
                        <DeleteOutlineIcon fontSize='small' />
                    </PermissionIconButton>
                )}
            </StyledTopRow>

            <SafeguardFormLayout>
                <SafeguardConfigurationSection>
                    <StyledTopRow sx={{ ml: 3, mb: 1.5 }}>
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
                                        handleApplicationChange(
                                            String(e.target.value),
                                        )
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
                                    <StyledMenuItem value='>'>
                                        More than
                                    </StyledMenuItem>
                                    <StyledMenuItem value='<'>
                                        Less than
                                    </StyledMenuItem>
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
                </SafeguardConfigurationSection>
            </SafeguardFormLayout>

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
                        projectId={projectId}
                        environmentId={environment}
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
            {children}
        </StyledFormContainer>
    );
};

const SafeguardFormDirect: FC<IBaseSafeguardFormProps> = ({
    onSubmit,
    onCancel,
    onDelete,
    safeguard,
    environment,
    featureId,
    badge,
}) => {
    const formState = useSafeguardFormState(safeguard, featureId);
    const { mode, setMode, buildSafeguardData, threshold } = formState;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (Number.isNaN(Number(threshold))) {
            return;
        }

        onSubmit(buildSafeguardData());

        // Show changes immediately
        if (mode === 'edit' || mode === 'create') {
            setMode('display');
        }
    };

    return (
        <SafeguardFormBase
            formState={formState}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            onDelete={onDelete}
            environment={environment}
            badge={badge}
        />
    );
};

const SafeguardFormWithChangeRequests: FC<IBaseSafeguardFormProps> = ({
    onSubmit,
    onCancel,
    onDelete,
    safeguard,
    environment,
    featureId,
    badge,
}) => {
    const formState = useSafeguardFormState(safeguard, featureId);
    const {
        mode,
        setMode,
        buildSafeguardData,
        threshold,
        resetToOriginalValues,
    } = formState;
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (Number.isNaN(Number(threshold))) {
            return;
        }

        setDialogOpen(true);
    };

    const handleDialogConfirm = () => {
        const safeguardData = buildSafeguardData();
        setDialogOpen(false);
        onSubmit(safeguardData);

        resetToOriginalValues();
        if (mode === 'create') {
            onCancel?.();
        } else {
            setMode('display');
        }
    };

    return (
        <SafeguardFormBase
            formState={formState}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            onDelete={onDelete}
            environment={environment}
            badge={badge}
        >
            <SafeguardChangeRequestDialog
                isOpen={dialogOpen}
                onConfirm={handleDialogConfirm}
                onClose={() => setDialogOpen(false)}
                safeguardData={buildSafeguardData()}
                environment={environment}
                mode={mode === 'edit' ? 'edit' : 'create'}
            />
        </SafeguardFormBase>
    );
};

export const SafeguardFormChangeRequestView: FC<IBaseSafeguardFormProps> = ({
    onSubmit,
    onCancel,
    onDelete,
    safeguard,
    environment,
    featureId,
    badge,
}) => {
    const formState = useSafeguardFormState(safeguard, featureId);
    const { mode, setMode, buildSafeguardData, threshold } = formState;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (Number.isNaN(Number(threshold))) {
            return;
        }

        onSubmit(buildSafeguardData());

        // Keep changes visible in CR view
        if (mode === 'edit' || mode === 'create') {
            setMode('display');
        }
    };

    return (
        <SafeguardFormBase
            formState={formState}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            onDelete={onDelete}
            environment={environment}
            badge={badge}
        />
    );
};

export const SafeguardForm: FC<IBaseSafeguardFormProps> = (props) => {
    const projectId = useRequiredPathParam('projectId');
    const { isChangeRequestConfigured } = useChangeRequestsEnabled(projectId);

    if (isChangeRequestConfigured(props.environment)) {
        return <SafeguardFormWithChangeRequests {...props} />;
    }

    return <SafeguardFormDirect {...props} />;
};
