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
    InputLabel,
    MenuItem,
    Select,
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
import { FeaturePicker } from './FeaturePicker';
import {
    DEFAULT_VIEW_ENVIRONMENT,
    DEFAULT_VIEW_TIME_RANGE,
    type MetricView,
    type ViewMetricConfig,
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

    const [title, setTitle] = useState('');
    const [featureNames, setFeatureNames] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<ViewMetricConfig[]>([]);
    const [timeRange, setTimeRange] = useState<ChartTimeRange>(
        DEFAULT_VIEW_TIME_RANGE,
    );
    const [environment, setEnvironment] = useState<string>(
        DEFAULT_VIEW_ENVIRONMENT,
    );

    useEffect(() => {
        if (!open) return;
        if (initialView) {
            setTitle(initialView.title);
            setFeatureNames(initialView.featureNames);
            setMetrics(initialView.metrics);
            setTimeRange(initialView.timeRange);
            setEnvironment(initialView.environment);
        } else {
            setTitle('');
            setFeatureNames([]);
            setMetrics([]);
            setTimeRange(DEFAULT_VIEW_TIME_RANGE);
            setEnvironment(DEFAULT_VIEW_ENVIRONMENT);
        }
    }, [open, initialView]);

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
            featureNames,
            metrics: metrics.map((metric) => ({ ...metric, timeRange })),
            timeRange,
            environment,
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
                    </StyledFieldGroup>

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
