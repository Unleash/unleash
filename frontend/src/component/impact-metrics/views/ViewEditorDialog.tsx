import { useEffect, useMemo, useState, type FC } from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Radio,
    Select,
    Switch,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import { useImpactMetricsOptions } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import {
    getDefaultAggregation,
    getMetricType,
} from 'component/impact-metrics/metricsFormatters';
import { createUuid } from 'utils/createUuid';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type { AggregationMode } from 'component/impact-metrics/types';
import { FeaturePicker } from './FeaturePicker';
import {
    DEFAULT_VIEW_ENVIRONMENT,
    TEMPLATE_DEFAULTS,
    type MetricView,
    type ViewMetricConfig,
    type ViewTemplate,
} from './types';

type ViewInput = Omit<MetricView, 'id' | 'createdAt' | 'updatedAt'>;

const StyledForm = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    paddingTop: theme.spacing(1),
}));

const StyledRow = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    flexWrap: 'wrap',
}));

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

const StyledMetricRows = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.5),
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

const AGGREGATION_OPTIONS: Array<{ value: AggregationMode; label: string }> = [
    { value: 'count', label: 'Count' },
    { value: 'rps', label: 'Rate per second' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'p50', label: '50th percentile' },
    { value: 'p95', label: '95th percentile' },
    { value: 'p99', label: '99th percentile' },
];

const AGGREGATION_LABEL: Record<AggregationMode, string> =
    AGGREGATION_OPTIONS.reduce(
        (acc, option) => {
            acc[option.value] = option.label;
            return acc;
        },
        {} as Record<AggregationMode, string>,
    );

type MetricOption = {
    name: string;
    displayName: string;
    help: string;
    source: 'internal' | 'external';
};

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

export type ViewEditorDialogProps = {
    open: boolean;
    initialView?: MetricView | null;
    template: ViewTemplate;
    onClose: () => void;
    onSave: (input: ViewInput) => void;
};

export const ViewEditorDialog: FC<ViewEditorDialogProps> = ({
    open,
    initialView,
    template,
    onClose,
    onSave,
}) => {
    const { metricOptions, loading: metricsLoading } =
        useImpactMetricsOptions();
    const { environments, loading: envLoading } = useEnvironments();

    const templateDefaults = TEMPLATE_DEFAULTS[template];
    const isGoalTracking = template === 'goal-tracking';
    const isSystemHealth = template === 'system-health';

    const [title, setTitle] = useState('');
    const [featureNames, setFeatureNames] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<ViewMetricConfig[]>([]);
    const [timeRange, setTimeRange] = useState<ChartTimeRange>(
        templateDefaults.timeRange,
    );
    const [environment, setEnvironment] = useState<string>(
        DEFAULT_VIEW_ENVIRONMENT,
    );
    const [normalize, setNormalize] = useState<boolean>(
        templateDefaults.normalize,
    );
    const [autoFollowFlags, setAutoFollowFlags] = useState<boolean>(
        templateDefaults.autoFollowFlags,
    );

    useEffect(() => {
        if (!open) return;
        if (initialView) {
            setTitle(initialView.title);
            setFeatureNames(initialView.featureNames);
            setMetrics(initialView.metrics);
            setTimeRange(initialView.timeRange);
            setEnvironment(initialView.environment);
            setNormalize(initialView.normalize ?? templateDefaults.normalize);
            setAutoFollowFlags(
                initialView.autoFollowFlags ?? templateDefaults.autoFollowFlags,
            );
        } else {
            setTitle('');
            setFeatureNames([]);
            setMetrics([]);
            setTimeRange(templateDefaults.timeRange);
            setEnvironment(DEFAULT_VIEW_ENVIRONMENT);
            setNormalize(templateDefaults.normalize);
            setAutoFollowFlags(templateDefaults.autoFollowFlags);
        }
    }, [open, initialView, templateDefaults]);

    const metricOptionsTyped = metricOptions as MetricOption[];

    const selectedOptions = useMemo<MetricOption[]>(
        () =>
            metrics.map(
                (metric) =>
                    metricOptionsTyped.find(
                        (option) => option.name === metric.metricName,
                    ) ?? {
                        name: metric.metricName,
                        displayName: metric.displayName,
                        help: '',
                        source: (metric.source ?? 'internal') as
                            | 'internal'
                            | 'external',
                    },
            ),
        [metrics, metricOptionsTyped],
    );

    const handleMetricsChange = (next: MetricOption[]) => {
        setMetrics((current) => {
            const byName = new Map(
                current.map((metric) => [metric.metricName, metric]),
            );
            return next.map(
                (option) =>
                    byName.get(option.name) ??
                    metricConfigFor(option, timeRange),
            );
        });
    };

    const handleAggregationChange = (
        metricName: string,
        aggregationMode: AggregationMode,
    ) => {
        setMetrics((current) =>
            current.map((metric) =>
                metric.metricName === metricName
                    ? { ...metric, aggregationMode }
                    : metric,
            ),
        );
    };

    const handleGoalChange = (metricName: string) => {
        setMetrics((current) =>
            current.map((metric) => ({
                ...metric,
                goal: metric.metricName === metricName,
            })),
        );
    };

    useEffect(() => {
        setMetrics((current) =>
            current.map((metric) => ({ ...metric, timeRange })),
        );
    }, [timeRange]);

    const isValid = title.trim().length > 0 && metrics.length > 0;

    const handleSave = () => {
        if (!isValid) return;
        onSave({
            title: title.trim(),
            template,
            featureNames,
            metrics: metrics.map((metric) => ({ ...metric, timeRange })),
            timeRange,
            environment,
            normalize: isGoalTracking ? normalize : undefined,
            autoFollowFlags: isSystemHealth ? autoFollowFlags : undefined,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
            <DialogTitle>
                {initialView ? 'Edit view' : 'Create a new view'}
            </DialogTitle>
            <DialogContent>
                <StyledForm>
                    <TextField
                        label='View title'
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
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
                            options={metricOptionsTyped}
                            value={selectedOptions}
                            onChange={(_, next) => handleMetricsChange(next)}
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
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <Typography variant='body2'>
                                            {option.displayName || option.name}
                                        </Typography>
                                        {option.help ? (
                                            <Typography
                                                variant='caption'
                                                sx={{
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {option.help}
                                            </Typography>
                                        ) : null}
                                    </Box>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={
                                        metrics.length === 0
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
                        {metrics.length > 0 ? (
                            <StyledMetricRows>
                                {metrics.map((metric) => {
                                    const inferredType = getMetricType(
                                        metric.metricName,
                                    );
                                    const inferred = inferredType === 'unknown';
                                    return (
                                        <StyledMetricRow
                                            key={metric.metricName}
                                        >
                                            {isGoalTracking ? (
                                                <FormControlLabel
                                                    sx={{ mr: 0 }}
                                                    aria-label={`Mark ${metric.displayName || metric.metricName} as the goal`}
                                                    control={
                                                        <Radio
                                                            size='small'
                                                            checked={Boolean(
                                                                metric.goal,
                                                            )}
                                                            onChange={() =>
                                                                handleGoalChange(
                                                                    metric.metricName,
                                                                )
                                                            }
                                                        />
                                                    }
                                                    label={
                                                        <Typography
                                                            variant='caption'
                                                            sx={{
                                                                color: 'text.secondary',
                                                            }}
                                                        >
                                                            Goal
                                                        </Typography>
                                                    }
                                                    labelPlacement='bottom'
                                                />
                                            ) : null}
                                            <StyledMetricName>
                                                <StyledMetricLabel
                                                    title={metric.metricName}
                                                >
                                                    {metric.displayName ||
                                                        metric.metricName}
                                                </StyledMetricLabel>
                                                <StyledMetricHint>
                                                    {inferred
                                                        ? 'Aggregation could not be inferred — pick one.'
                                                        : `${inferredType.charAt(0).toUpperCase()}${inferredType.slice(1)} metric · default ${AGGREGATION_LABEL[metric.aggregationMode] ?? metric.aggregationMode}`}
                                                </StyledMetricHint>
                                            </StyledMetricName>
                                            <FormControl
                                                size='small'
                                                variant='outlined'
                                                sx={{ minWidth: 180 }}
                                            >
                                                <InputLabel
                                                    id={`agg-${metric.metricName}`}
                                                >
                                                    Aggregation
                                                </InputLabel>
                                                <Select
                                                    labelId={`agg-${metric.metricName}`}
                                                    value={
                                                        metric.aggregationMode
                                                    }
                                                    label='Aggregation'
                                                    onChange={(event) =>
                                                        handleAggregationChange(
                                                            metric.metricName,
                                                            event.target
                                                                .value as AggregationMode,
                                                        )
                                                    }
                                                >
                                                    {AGGREGATION_OPTIONS.map(
                                                        (option) => (
                                                            <MenuItem
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </MenuItem>
                                                        ),
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </StyledMetricRow>
                                    );
                                })}
                            </StyledMetricRows>
                        ) : null}
                    </StyledFieldGroup>

                    {isGoalTracking ? (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={normalize}
                                    onChange={(event) =>
                                        setNormalize(event.target.checked)
                                    }
                                />
                            }
                            label={
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography variant='body2'>
                                        Normalize to baseline
                                    </Typography>
                                    <Typography
                                        variant='caption'
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        Rebase each series so its first value is
                                        100, so signals and goal are readable on
                                        one axis. Totals stay raw.
                                    </Typography>
                                </Box>
                            }
                        />
                    ) : null}

                    {isSystemHealth ? (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoFollowFlags}
                                    onChange={(event) =>
                                        setAutoFollowFlags(event.target.checked)
                                    }
                                />
                            }
                            label={
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography variant='body2'>
                                        Auto-follow recently changed flags
                                    </Typography>
                                    <Typography
                                        variant='caption'
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        Pull flags with state changes in the
                                        selected environment + time window.
                                        Manually pinned flags are always
                                        included.
                                    </Typography>
                                </Box>
                            }
                        />
                    ) : null}

                    <FeaturePicker
                        value={featureNames}
                        onChange={setFeatureNames}
                    />

                    <StyledRow>
                        <StyledFieldGroup>
                            <FormControl size='small' variant='outlined'>
                                <InputLabel id='view-time-range-label'>
                                    Time range
                                </InputLabel>
                                <Select
                                    labelId='view-time-range-label'
                                    value={timeRange}
                                    label='Time range'
                                    onChange={(event) =>
                                        setTimeRange(
                                            event.target
                                                .value as ChartTimeRange,
                                        )
                                    }
                                >
                                    <MenuItem value='hour'>Last hour</MenuItem>
                                    <MenuItem value='day'>
                                        Last 24 hours
                                    </MenuItem>
                                    <MenuItem value='week'>
                                        Last 7 days
                                    </MenuItem>
                                    <MenuItem value='month'>
                                        Last 30 days
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </StyledFieldGroup>
                        <StyledFieldGroup>
                            <FormControl size='small' variant='outlined'>
                                <InputLabel id='view-env-label'>
                                    Environment
                                </InputLabel>
                                <Select
                                    labelId='view-env-label'
                                    value={environment}
                                    label='Environment'
                                    disabled={envLoading}
                                    onChange={(event) =>
                                        setEnvironment(event.target.value)
                                    }
                                >
                                    {environments.length > 0 ? (
                                        environments.map((env) => (
                                            <MenuItem
                                                key={env.name}
                                                value={env.name}
                                            >
                                                {env.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem
                                            value={DEFAULT_VIEW_ENVIRONMENT}
                                        >
                                            {DEFAULT_VIEW_ENVIRONMENT}
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            <StyledHelper>
                                Toggle events from this environment are drawn
                                over the chart.
                            </StyledHelper>
                        </StyledFieldGroup>
                    </StyledRow>
                </StyledForm>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant='contained'
                    onClick={handleSave}
                    disabled={!isValid}
                >
                    {initialView ? 'Save changes' : 'Create view'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
