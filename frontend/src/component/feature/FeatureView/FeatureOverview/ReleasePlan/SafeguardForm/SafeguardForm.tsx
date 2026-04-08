import {
    Button,
    FormControl,
    TextField,
    Box,
    styled,
    MenuItem,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/ShieldOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState, type FC } from 'react';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useNumericStringInput } from 'hooks/useNumericStringInput';
import { MiniMetricsChartWithTooltip } from './MiniMetricsChartWithTooltip.tsx';
import {
    useImpactMetricsOptions,
    type ImpactMetricsSeries,
} from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useImpactMetricsData } from 'hooks/api/getters/useImpactMetricsData/useImpactMetricsData';
import { RangeSelector } from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/RangeSelector/RangeSelector';
import { ModeSelector } from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/ModeSelector/ModeSelector';
import {
    MetricSelector,
    type MetricSelection,
} from 'component/impact-metrics/ChartConfigModal/ImpactMetricsControls/SeriesSelector/MetricSelector.tsx';
import type { MetricSource } from 'component/impact-metrics/types';
import {
    getDefaultAggregation,
    getMetricType,
    type MetricType,
} from 'component/impact-metrics/metricsFormatters.ts';
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
import {
    UPDATE_FEATURE_ENVIRONMENT,
    UPDATE_FEATURE_STRATEGY,
} from 'component/providers/AccessProvider/permissions.ts';
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
export type SafeguardType = 'releasePlan' | 'featureEnvironment';

const buildLabelSelectors = (
    appName: string,
    environment?: string,
): Record<string, string[]> => {
    const selectors: Record<string, string[]> = {};

    if (environment) {
        selectors.environment = [environment];
    }

    if (appName !== '*') {
        selectors.appName = [appName];
    }

    return selectors;
};

interface IBaseSafeguardFormProps {
    onSubmit: (data: CreateSafeguardSchema) => void;
    onCancel?: () => void;
    onDelete?: () => void;
    safeguard?: ISafeguard;
    environment: string;
    featureId: string;
    badge?: ReactNode;
    safeguardType?: SafeguardType;
}

type MetricOption = { name: string } & ImpactMetricsSeries;

const getInitialValues = (safeguard?: ISafeguard) => ({
    metricName: safeguard?.impactMetric.metricName || '',
    source: (safeguard?.impactMetric as { source?: MetricSource })
        ?.source,
    appName: safeguard?.impactMetric.labelSelectors.appName?.[0] || '*',
    aggregationMode: (safeguard?.impactMetric.aggregationMode ||
        'rps') as MetricQuerySchemaAggregationMode,
    operator: (safeguard?.triggerCondition?.operator ||
        '>') as SafeguardTriggerConditionSchemaOperator,
    threshold: safeguard?.triggerCondition?.threshold || 0,
    timeRange: (safeguard?.impactMetric.timeRange ||
        'day') as MetricQuerySchemaTimeRange,
});

const useSafeguardFormValues = (safeguard?: ISafeguard) => {
    const initialValues = useMemo(
        () => getInitialValues(safeguard),
        [safeguard],
    );

    const [metricName, setMetricName] = useState(initialValues.metricName);
    const [source, setSource] = useState<MetricSource | undefined>(
        initialValues.source,
    );
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
        setSource(initialValues.source);
        setAppName(initialValues.appName);
        setAggregationMode(initialValues.aggregationMode);
        setOperator(initialValues.operator);
        setThreshold(initialValues.threshold);
        setTimeRange(initialValues.timeRange);
    };

    return {
        metricName,
        setMetricName,
        source,
        setSource,
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
    environment: string,
    source?: MetricSource,
) => {
    const { metricOptions, loading } = useImpactMetricsOptions();
    const { data: metricsData } = useImpactMetricsData(
        metricName
            ? {
                  series: metricName,
                  range: timeRange,
                  aggregationMode: aggregationMode,
                  source,
              }
            : undefined,
    );

    const applicationNames = useMemo(() => {
        const appNames = metricsData?.labels?.appName || [];
        return ['*', ...appNames];
    }, [metricsData?.labels?.appName]);

    const metricType = getMetricType(
        metricName,
        metricsData?.labels?.metric_type,
    );

    // External Prometheus metrics may not have an environment label —
    // only filter by environment when the metric actually exposes one.
    // When the label exists, always filter by the current environment even
    // if it's not in the values list — showing unfiltered data from other
    // environments (e.g. development data in production) would be misleading.
    const metricEnvironment = metricsData?.labels?.environment
        ? environment
        : undefined;

    return {
        metricOptions,
        loading,
        applicationNames,
        metricType,
        metricEnvironment,
    };
};

const useSafeguardFormHandlers = (
    formValues: ReturnType<typeof useSafeguardFormValues>,
    formMode: ReturnType<typeof useSafeguardFormMode>,
    metricOptions: MetricOption[],
    metricType: MetricType,
) => {
    const {
        setMetricName,
        setSource,
        setAppName,
        setAggregationMode,
        setOperator,
        setThreshold,
        setTimeRange,
    } = formValues;
    const { enterEditMode } = formMode;
    const initialMetricName = formValues.initialValues.metricName;

    // Auto-select first metric when options become available
    useEffect(() => {
        if (metricOptions.length > 0 && !formValues.metricName) {
            setMetricName(metricOptions[0].name);
            setSource(metricOptions[0].source);
        }
    }, [metricOptions, formValues.metricName, setMetricName, setSource]);

    // Set default aggregation when metric type becomes known
    // Skip when metric hasn't changed from initial (existing safeguard opened)
    useEffect(() => {
        if (
            formValues.metricName !== initialMetricName &&
            metricType !== 'unknown'
        ) {
            setAggregationMode(getDefaultAggregation(metricType));
        }
    }, [formValues.metricName, initialMetricName, metricType]);

    const handleMetricChange = ({
        series,
        source: newSource,
    }: MetricSelection) => {
        enterEditMode();
        setMetricName(series);
        setSource(newSource);
        setAppName('*');
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
    environment: string,
    onSubmit: (data: CreateSafeguardSchema) => void,
) => {
    const projectId = useRequiredPathParam('projectId');
    const formValues = useSafeguardFormValues(safeguard);
    const formMode = useSafeguardFormMode(safeguard);
    const metricsData = useSafeguardMetricsData(
        formValues.metricName,
        formValues.timeRange,
        formValues.aggregationMode,
        environment,
        formValues.source,
    );
    const handlers = useSafeguardFormHandlers(
        formValues,
        formMode,
        metricsData.metricOptions,
        metricsData.metricType,
    );

    const labelSelectors = useMemo(
        () =>
            buildLabelSelectors(
                formValues.appName,
                metricsData.metricEnvironment,
            ),
        [formValues.appName, metricsData.metricEnvironment],
    );

    const safeguardData: CreateSafeguardSchema = useMemo(
        () => ({
            impactMetric: {
                metricName: formValues.metricName,
                timeRange: formValues.timeRange,
                aggregationMode: formValues.aggregationMode,
                labelSelectors,
                ...(formValues.source ? { source: formValues.source } : {}),
            },
            triggerCondition: {
                operator: formValues.operator,
                threshold: Number(formValues.threshold),
            },
        }),
        [
            formValues.metricName,
            formValues.source,
            formValues.timeRange,
            formValues.aggregationMode,
            labelSelectors,
            formValues.operator,
            formValues.threshold,
        ],
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (Number.isNaN(Number(formValues.threshold))) {
            return;
        }

        onSubmit(safeguardData);

        if (formMode.mode === 'edit' || formMode.mode === 'create') {
            formMode.setMode('display');
        }
    };

    return {
        ...formValues,
        ...formMode,
        ...metricsData,
        ...handlers,
        projectId,
        featureId,
        labelSelectors,
        handleSubmit,
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
    safeguardType?: SafeguardType;
}

const safeguardTypeLabel: Record<SafeguardType, string> = {
    releasePlan: 'Pause automation when',
    featureEnvironment: 'Disable environment when',
};

const SafeguardFormBase: FC<SafeguardFormBaseProps> = ({
    formState,
    onSubmit,
    onCancel,
    onDelete,
    environment,
    badge,
    children,
    safeguardType = 'releasePlan',
}) => {
    const {
        metricName,
        source,
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
        enterEditMode,
        labelSelectors,
    } = formState;

    const permission =
        safeguardType === 'featureEnvironment'
            ? UPDATE_FEATURE_ENVIRONMENT
            : UPDATE_FEATURE_STRATEGY;

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

    const miniChartMetricDisplayName = metricOptions.find(
        (m) => m.name === metricName,
    )?.displayName;

    const {
        inputValue: thresholdInputValue,
        handleInputChange: handleThresholdInputChange,
        handleInputBlur: handleThresholdInputBlur,
        handleKeyDown: handleThresholdKeyDown,
        handleFocus: handleThresholdFocus,
    } = useNumericStringInput(threshold, handleThresholdChange, {
        onEditStart: enterEditMode,
    });

    return (
        <StyledFormContainer onSubmit={onSubmit} mode={mode}>
            <StyledTopRow>
                <StyledIcon />
                <StyledLabel sx={{ mr: 'auto' }}>
                    {safeguardTypeLabel[safeguardType]}
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
                        source={source}
                    />
                )}
                {mode !== 'create' && onDelete && (
                    <PermissionIconButton
                        permission={permission}
                        projectId={projectId}
                        environmentId={environment}
                        onClick={handleDelete}
                        size='small'
                        aria-label='Remove safeguard'
                        tooltipProps={{
                            title: 'Remove safeguard',
                        }}
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
                            <StyledLabel sx={{ ml: 2.5 }}>is</StyledLabel>
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
                                    value={thresholdInputValue}
                                    onChange={handleThresholdInputChange}
                                    onFocus={handleThresholdFocus}
                                    onBlur={handleThresholdInputBlur}
                                    onKeyDown={handleThresholdKeyDown}
                                    placeholder='Value'
                                    variant='outlined'
                                    size='small'
                                    required
                                />
                            </FormControl>
                        </StyledTopRow>

                        <StyledTopRow>
                            <StyledLabel>over</StyledLabel>
                            {/* Every range has an alert observation window equal to its step. Backend implies the step from the range */}
                            <RangeSelector
                                value={timeRange}
                                onChange={handleTimeRangeChange}
                                label=''
                            >
                                <MenuItem value='hour'>Last minute</MenuItem>
                                <MenuItem value='day'>Last 15 minutes</MenuItem>
                                <MenuItem value='week'>Last 3 hours</MenuItem>
                                <MenuItem value='month'>Last day</MenuItem>
                            </RangeSelector>
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
                        permission={permission}
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

export const SafeguardForm: FC<IBaseSafeguardFormProps> = ({
    onSubmit,
    onCancel,
    onDelete,
    safeguard,
    environment,
    featureId,
    badge,
    safeguardType,
}) => {
    const formState = useSafeguardFormState(
        safeguard,
        featureId,
        environment,
        onSubmit,
    );

    return (
        <SafeguardFormBase
            formState={formState}
            onSubmit={formState.handleSubmit}
            onCancel={onCancel}
            onDelete={onDelete}
            environment={environment}
            badge={badge}
            safeguardType={safeguardType}
        />
    );
};
