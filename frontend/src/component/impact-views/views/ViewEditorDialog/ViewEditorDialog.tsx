import { useEffect, useReducer, type FC } from 'react';
import {
    Autocomplete,
    Box,
    FormControlLabel,
    Radio,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import GeneralSelect, {
    type ISelectOption,
} from 'component/common/GeneralSelect/GeneralSelect';
import { useImpactMetricsOptions } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import {
    getDefaultAggregation,
    getMetricType,
} from 'component/impact-metrics/metricsFormatters';
import { createUuid } from 'utils/createUuid';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type { AggregationMode } from 'component/impact-metrics/types';
import type { AvailableImpactMetricsSchemaMetricsItem } from 'openapi';
import { FeaturePicker } from '../FeaturePicker/FeaturePicker';
import type { MetricView, ViewMetricConfig } from '../types';
import { TIME_RANGE_OPTIONS } from '../../constants';

type ViewInput = Omit<MetricView, 'id' | 'createdAt' | 'updatedAt'>;

const DEFAULT_ENVIRONMENT = 'production';
const DEFAULT_TIME_RANGE: ChartTimeRange = 'month';
const DEFAULT_AGGREGATION: AggregationMode = 'count';

const StyledFieldGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    flex: 1,
    minWidth: 220,
}));

const StyledFieldLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledHelper = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledMetricRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledMetricName = styled('div')(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
}));

const StyledMetricLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const StyledMetricHint = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const AGGREGATION_OPTIONS: ISelectOption[] = [
    { key: 'count', label: 'Count' },
    { key: 'rps', label: 'Rate per second' },
    { key: 'sum', label: 'Sum' },
    { key: 'avg', label: 'Average' },
    { key: 'p50', label: '50th percentile' },
    { key: 'p95', label: '95th percentile' },
    { key: 'p99', label: '99th percentile' },
];

type MetricOption = AvailableImpactMetricsSchemaMetricsItem;

const metricConfigFor = (
    option: MetricOption,
    timeRange: ChartTimeRange,
): ViewMetricConfig => {
    const metricType = getMetricType(option.name);
    return {
        id: createUuid(),
        metricName: option.name,
        displayName: option.displayName || option.name,
        aggregationMode: getDefaultAggregation(metricType),
        labelSelectors: {},
        source: option.source,
        title: undefined,
        yAxisMin: 'auto',
        timeRange,
    };
};

const metricTypeHint = (metricName: string): string => {
    const metricType = getMetricType(metricName);
    if (metricType === 'unknown') return 'Metric type could not be inferred.';
    return `${metricType.charAt(0).toUpperCase()}${metricType.slice(1)} metric`;
};

const MetricOptionRow: FC<{ option: MetricOption }> = ({ option }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant='body2'>
            {option.displayName || option.name}
        </Typography>
        {option.help ? (
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {option.help}
            </Typography>
        ) : null}
    </Box>
);

const MetricGoalRow: FC<{
    metric: ViewMetricConfig;
    onSelectGoal: (metricName: string) => void;
}> = ({ metric, onSelectGoal }) => {
    const label = metric.displayName || metric.metricName;
    return (
        <StyledMetricRow>
            <FormControlLabel
                sx={{ mr: 0 }}
                aria-label={`Mark ${label} as the goal`}
                control={
                    <Radio
                        size='small'
                        checked={Boolean(metric.goal)}
                        onChange={() => onSelectGoal(metric.metricName)}
                    />
                }
                label={
                    <Typography
                        variant='caption'
                        sx={{ color: 'text.secondary' }}
                    >
                        Goal
                    </Typography>
                }
                labelPlacement='bottom'
            />
            <StyledMetricName>
                <StyledMetricLabel title={metric.metricName}>
                    {label}
                </StyledMetricLabel>
                <StyledMetricHint>
                    {metricTypeHint(metric.metricName)}
                </StyledMetricHint>
            </StyledMetricName>
        </StyledMetricRow>
    );
};

export type ViewFormData = {
    title: string;
    featureNames: string[];
    metrics: ViewMetricConfig[];
    timeRange: ChartTimeRange;
    aggregationMode: AggregationMode;
    environment: string;
};

const seedForm = (initialView?: MetricView | null): ViewFormData => {
    if (!initialView) {
        return {
            title: '',
            featureNames: [],
            metrics: [],
            timeRange: DEFAULT_TIME_RANGE,
            aggregationMode: DEFAULT_AGGREGATION,
            environment: DEFAULT_ENVIRONMENT,
        };
    }
    const goalMetric =
        initialView.metrics.find((metric) => metric.goal) ??
        initialView.metrics[0];
    return {
        title: initialView.title,
        featureNames: initialView.featureNames,
        metrics: initialView.metrics,
        timeRange: initialView.timeRange,
        aggregationMode: goalMetric?.aggregationMode ?? DEFAULT_AGGREGATION,
        environment: initialView.environment,
    };
};

type FormAction =
    | { type: 'reset'; form: ViewFormData }
    | { type: 'setTitle'; title: string }
    | { type: 'setFeatureNames'; featureNames: string[] }
    | { type: 'setMetrics'; options: MetricOption[] }
    | { type: 'setTimeRange'; timeRange: ChartTimeRange }
    | { type: 'setAggregation'; aggregationMode: AggregationMode }
    | { type: 'setGoal'; metricName: string }
    | { type: 'setEnvironment'; environment: string };

const patchMetrics = (
    metrics: ViewMetricConfig[],
    patch: Partial<ViewMetricConfig>,
): ViewMetricConfig[] => metrics.map((metric) => ({ ...metric, ...patch }));

const formReducer = (state: ViewFormData, action: FormAction): ViewFormData => {
    switch (action.type) {
        case 'reset':
            return action.form;
        case 'setTitle':
            return { ...state, title: action.title };
        case 'setFeatureNames':
            return { ...state, featureNames: action.featureNames };
        case 'setEnvironment':
            return { ...state, environment: action.environment };
        case 'setTimeRange':
            return {
                ...state,
                timeRange: action.timeRange,
                metrics: patchMetrics(state.metrics, {
                    timeRange: action.timeRange,
                }),
            };
        case 'setAggregation':
            return {
                ...state,
                aggregationMode: action.aggregationMode,
                metrics: patchMetrics(state.metrics, {
                    aggregationMode: action.aggregationMode,
                }),
            };
        case 'setMetrics': {
            const aggregationMode =
                state.metrics.length === 0 && action.options.length > 0
                    ? getDefaultAggregation(
                          getMetricType(action.options[0].name),
                      )
                    : state.aggregationMode;
            const byName = new Map(
                state.metrics.map((metric) => [metric.metricName, metric]),
            );
            const metrics = action.options.map(
                (option) =>
                    byName.get(option.name) ??
                    metricConfigFor(option, state.timeRange),
            );
            return {
                ...state,
                aggregationMode,
                metrics: patchMetrics(metrics, { aggregationMode }),
            };
        }
        case 'setGoal':
            return {
                ...state,
                metrics: state.metrics.map((metric) => ({
                    ...metric,
                    goal: metric.metricName === action.metricName,
                })),
            };
    }
};

export type ViewEditorDialogProps = {
    open: boolean;
    initialView?: MetricView | null;
    onClose: () => void;
    onSave: (input: ViewInput) => void;
};

export const ViewEditorDialog: FC<ViewEditorDialogProps> = ({
    open,
    initialView,
    onClose,
    onSave,
}) => {
    const { metricOptions, loading: metricsLoading } =
        useImpactMetricsOptions();
    const { environments, loading: envLoading } = useEnvironments();

    const [form, dispatch] = useReducer(formReducer, initialView, seedForm);

    useEffect(() => {
        if (!open) return;
        dispatch({ type: 'reset', form: seedForm(initialView) });
    }, [open, initialView]);

    const optionForMetric = (metric: ViewMetricConfig): MetricOption =>
        metricOptions.find((option) => option.name === metric.metricName) ?? {
            name: metric.metricName,
            displayName: metric.displayName,
            help: '',
            source: metric.source === 'external' ? 'external' : 'internal',
        };
    const selectedOptions = form.metrics.map(optionForMetric);

    const environmentOptions: ISelectOption[] =
        environments.length > 0
            ? environments.map((env) => ({ key: env.name, label: env.name }))
            : [{ key: DEFAULT_ENVIRONMENT, label: DEFAULT_ENVIRONMENT }];

    const isValid = form.title.trim().length > 0 && form.metrics.length > 0;

    const handleSave = () => {
        if (!isValid) return;
        onSave({
            title: form.title.trim(),
            featureNames: form.featureNames,
            metrics: form.metrics,
            timeRange: form.timeRange,
            environment: form.environment,
        });
    };

    return (
        <Dialogue
            open={open}
            onClose={onClose}
            onClick={handleSave}
            title={initialView ? 'Edit view' : 'Create a new view'}
            primaryButtonText={initialView ? 'Save changes' : 'Create view'}
            secondaryButtonText='Cancel'
            disabledPrimaryButton={!isValid}
            maxWidth='md'
            fullWidth
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    pt: 1,
                }}
            >
                <TextField
                    label='View title'
                    value={form.title}
                    onChange={(event) =>
                        dispatch({
                            type: 'setTitle',
                            title: event.target.value,
                        })
                    }
                    placeholder='e.g. Checkout funnel'
                    size='small'
                    autoFocus
                    required
                />

                <StyledFieldGroup>
                    <StyledFieldLabel>Metrics</StyledFieldLabel>
                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        loading={metricsLoading}
                        options={metricOptions}
                        value={selectedOptions}
                        onChange={(_, next) =>
                            dispatch({ type: 'setMetrics', options: next })
                        }
                        isOptionEqualToValue={(option, selected) =>
                            option.name === selected.name
                        }
                        getOptionLabel={(option) =>
                            option.displayName || option.name
                        }
                        groupBy={(option) =>
                            option.source === 'external'
                                ? 'External metrics'
                                : 'Internal metrics'
                        }
                        renderOption={(props, option) => (
                            <Box
                                component='li'
                                {...props}
                                key={`${option.source}__${option.name}`}
                            >
                                <MetricOptionRow option={option} />
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder={
                                    form.metrics.length === 0
                                        ? 'Pick one or more metrics…'
                                        : 'Add another metric…'
                                }
                                size='small'
                                variant='outlined'
                            />
                        )}
                    />
                    <StyledHelper>
                        All selected metrics are drawn together on a single
                        chart.
                    </StyledHelper>
                    {form.metrics.length > 0 ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                mt: 0.5,
                            }}
                        >
                            {form.metrics.map((metric) => (
                                <MetricGoalRow
                                    key={metric.metricName}
                                    metric={metric}
                                    onSelectGoal={(metricName) =>
                                        dispatch({
                                            type: 'setGoal',
                                            metricName,
                                        })
                                    }
                                />
                            ))}
                        </Box>
                    ) : null}
                </StyledFieldGroup>

                <FeaturePicker
                    value={form.featureNames}
                    onChange={(featureNames) =>
                        dispatch({ type: 'setFeatureNames', featureNames })
                    }
                />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <StyledFieldGroup>
                        <GeneralSelect<AggregationMode>
                            id='view-aggregation'
                            labelId='view-aggregation-label'
                            label='Aggregation'
                            value={form.aggregationMode}
                            options={AGGREGATION_OPTIONS}
                            onChange={(aggregationMode) =>
                                dispatch({
                                    type: 'setAggregation',
                                    aggregationMode,
                                })
                            }
                        />
                        <StyledHelper>
                            Applied to all metrics in this view.
                        </StyledHelper>
                    </StyledFieldGroup>
                    <StyledFieldGroup>
                        <GeneralSelect<ChartTimeRange>
                            id='view-time-range'
                            labelId='view-time-range-label'
                            label='Time range'
                            value={form.timeRange}
                            options={TIME_RANGE_OPTIONS}
                            onChange={(timeRange) =>
                                dispatch({ type: 'setTimeRange', timeRange })
                            }
                        />
                    </StyledFieldGroup>
                    <StyledFieldGroup>
                        <GeneralSelect
                            id='view-environment'
                            labelId='view-environment-label'
                            label='Environment'
                            value={form.environment}
                            options={environmentOptions}
                            disabled={envLoading}
                            onChange={(environment) =>
                                dispatch({
                                    type: 'setEnvironment',
                                    environment,
                                })
                            }
                        />
                        <StyledHelper>
                            Toggle events from this environment are drawn over
                            the chart.
                        </StyledHelper>
                    </StyledFieldGroup>
                </Box>
            </Box>
        </Dialogue>
    );
};
