import { useEffect, useReducer, type FC } from 'react';
import {
    Autocomplete,
    Box,
    FormControlLabel,
    IconButton,
    Radio,
    Switch,
    TextField,
    Tooltip,
    Typography,
    styled,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
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
    gap: theme.spacing(2),
    padding: theme.spacing(2, 2.5),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledMetricName = styled('div')(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StyledNameInput = styled(TextField)(({ theme }) => ({
    maxWidth: theme.spacing(30),
}));

const StyledMetricHint = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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

const metricToOption = (metric: ViewMetricConfig): MetricOption => ({
    name: metric.metricName,
    displayName: metric.displayName,
    help: '',
    source: metric.source === 'external' ? 'external' : 'internal',
});

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
    onSelectGoal: (id: string) => void;
    onRename: (id: string, displayName: string) => void;
    onRemove: (id: string) => void;
}> = ({ metric, onSelectGoal, onRename, onRemove }) => {
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
                        onChange={() => onSelectGoal(metric.id)}
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
                <StyledNameInput
                    label='Display name'
                    value={metric.displayName ?? ''}
                    onChange={(event) =>
                        onRename(metric.id, event.target.value)
                    }
                    placeholder={metric.metricName}
                    size='small'
                    variant='outlined'
                    fullWidth
                />
                <StyledMetricHint title={metric.metricName}>
                    {metric.metricName} · {metricTypeHint(metric.metricName)}
                </StyledMetricHint>
            </StyledMetricName>
            <Tooltip title='Remove metric' arrow>
                <IconButton
                    size='medium'
                    aria-label={`Remove ${label}`}
                    onClick={() => onRemove(metric.id)}
                >
                    <Delete />
                </IconButton>
            </Tooltip>
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
    showTopMovers: boolean;
};

const goalAggregation = (metrics: ViewMetricConfig[]): AggregationMode => {
    const goalMetric = metrics.find((metric) => metric.goal) ?? metrics[0];
    return goalMetric?.aggregationMode ?? DEFAULT_AGGREGATION;
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
            showTopMovers: false,
        };
    }
    return {
        title: initialView.title,
        featureNames: initialView.featureNames,
        metrics: initialView.metrics,
        timeRange: initialView.timeRange,
        aggregationMode: goalAggregation(initialView.metrics),
        environment: initialView.environment,
        showTopMovers: initialView.showTopMovers ?? false,
    };
};

type FormAction =
    | { type: 'reset'; form: ViewFormData }
    | { type: 'setTitle'; title: string }
    | { type: 'setFeatureNames'; featureNames: string[] }
    | { type: 'setMetrics'; options: MetricOption[] }
    | { type: 'setTimeRange'; timeRange: ChartTimeRange }
    | { type: 'setAggregation'; aggregationMode: AggregationMode }
    | { type: 'setGoal'; id: string }
    | { type: 'renameMetric'; id: string; displayName: string }
    | { type: 'removeMetric'; id: string }
    | { type: 'setEnvironment'; environment: string }
    | { type: 'setShowTopMovers'; showTopMovers: boolean };

const patchMetrics = (
    metrics: ViewMetricConfig[],
    patch: Partial<ViewMetricConfig>,
): ViewMetricConfig[] => metrics.map((metric) => ({ ...metric, ...patch }));

const aggregationForSelection = (
    state: ViewFormData,
    options: MetricOption[],
): AggregationMode => {
    const addingFirstMetric = state.metrics.length === 0 && options.length > 0;
    if (addingFirstMetric) {
        return getDefaultAggregation(getMetricType(options[0].name));
    }
    return state.aggregationMode;
};

const mergeSelectedMetrics = (
    state: ViewFormData,
    options: MetricOption[],
): ViewMetricConfig[] => {
    const existingByName = new Map(
        state.metrics.map((metric) => [metric.metricName, metric]),
    );
    return options.map(
        (option) =>
            existingByName.get(option.name) ??
            metricConfigFor(option, state.timeRange),
    );
};

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
        case 'setShowTopMovers':
            return { ...state, showTopMovers: action.showTopMovers };
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
            const aggregationMode = aggregationForSelection(
                state,
                action.options,
            );
            const metrics = mergeSelectedMetrics(state, action.options);
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
                    goal: metric.id === action.id,
                })),
            };
        case 'renameMetric':
            return {
                ...state,
                metrics: state.metrics.map((metric) =>
                    metric.id === action.id
                        ? { ...metric, displayName: action.displayName }
                        : metric,
                ),
            };
        case 'removeMetric':
            return {
                ...state,
                metrics: state.metrics.filter(
                    (metric) => metric.id !== action.id,
                ),
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
        metricOptions.find((option) => option.name === metric.metricName) ??
        metricToOption(metric);
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
            showTopMovers: form.showTopMovers,
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
                                    key={metric.id}
                                    metric={metric}
                                    onSelectGoal={(id) =>
                                        dispatch({ type: 'setGoal', id })
                                    }
                                    onRename={(id, displayName) =>
                                        dispatch({
                                            type: 'renameMetric',
                                            id,
                                            displayName,
                                        })
                                    }
                                    onRemove={(id) =>
                                        dispatch({ type: 'removeMetric', id })
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

                <StyledFieldGroup>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={form.showTopMovers}
                                onChange={(event) =>
                                    dispatch({
                                        type: 'setShowTopMovers',
                                        showTopMovers: event.target.checked,
                                    })
                                }
                            />
                        }
                        label='Show top movers'
                    />
                    <StyledHelper>
                        Ranks the flags whose toggle had the biggest effect on
                        the goal metric, shown beside the chart.
                    </StyledHelper>
                </StyledFieldGroup>
            </Box>
        </Dialogue>
    );
};
