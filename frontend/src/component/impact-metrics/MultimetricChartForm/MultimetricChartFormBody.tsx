import { type FC, useCallback } from 'react';
import {
    Box,
    Button,
    IconButton,
    MenuItem,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import { MetricSelector } from '../ImpactMetricModal/ImpactMetricsControls/SeriesSelector/MetricSelector';
import { RangeSelector } from '../ImpactMetricModal/ImpactMetricsControls/RangeSelector/RangeSelector';
import { ModeSelector } from '../ImpactMetricModal/ImpactMetricsControls/ModeSelector/ModeSelector';
import { getDefaultAggregation, getMetricType } from '../metricsFormatters';
import type { ImpactMetric } from 'hooks/api/getters/useImpactMetricsMetadata/useImpactMetricsMetadata';
import { EnvironmentMultiSelect } from './EnvironmentMultiSelect';
import type { MultimetricChartFormConfig, MultimetricStepInput } from './types';

export const MIN_STEPS = 2;
export const MAX_STEPS = 5;

export const emptyStep = (): MultimetricStepInput => ({
    id: crypto.randomUUID(),
    metricName: '',
    label: '',
    aggregationMode: 'count',
});

export const initialFormConfig = (): MultimetricChartFormConfig => ({
    title: '',
    timeRange: 'day',
    steps: [emptyStep(), emptyStep()],
    featureEventEnvironments: [],
});

export const isFormValid = (config: MultimetricChartFormConfig): boolean =>
    config.title.trim().length > 0 &&
    config.steps.length >= MIN_STEPS &&
    config.steps.every(
        (step) => step.metricName.length > 0 && step.label.trim().length > 0,
    );

const StyledStepCard = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledStepHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
}));

const StyledStepActions = styled(Box)({
    display: 'flex',
    alignItems: 'center',
});

const StyledStepControls = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
}));

type MultimetricChartFormBodyProps = {
    projectId: string;
    config: MultimetricChartFormConfig;
    onChange: (next: MultimetricChartFormConfig) => void;
    metrics: ImpactMetric[];
    loading?: boolean;
};

// Renders the multi-step builder for a multi-metric chart: title, time range,
// 2-5 metric steps (with reorder/remove controls), and a multi-select picker
// for which environments' feature-enable/disable events to overlay.
export const MultimetricChartFormBody: FC<MultimetricChartFormBodyProps> = ({
    projectId,
    config,
    onChange,
    metrics,
    loading = false,
}) => {
    const { title, timeRange, steps, featureEventEnvironments } = config;

    const updateStep = useCallback(
        (index: number, updates: Partial<MultimetricStepInput>) => {
            onChange({
                ...config,
                steps: config.steps.map((step, stepIndex) =>
                    stepIndex === index ? { ...step, ...updates } : step,
                ),
            });
        },
        [config, onChange],
    );

    const addStep = () => {
        if (steps.length >= MAX_STEPS) return;
        onChange({ ...config, steps: [...steps, emptyStep()] });
    };

    const removeStep = (index: number) => {
        if (steps.length <= MIN_STEPS) return;
        onChange({
            ...config,
            steps: steps.filter((_, stepIndex) => stepIndex !== index),
        });
    };

    const moveStep = (index: number, direction: -1 | 1) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= steps.length) return;
        const next = [...steps];
        [next[index], next[newIndex]] = [next[newIndex], next[index]];
        onChange({ ...config, steps: next });
    };

    return (
        <>
            <TextField
                label='Chart title'
                value={title}
                onChange={(event) =>
                    onChange({ ...config, title: event.target.value })
                }
                fullWidth
                variant='outlined'
                size='small'
                required
            />

            <RangeSelector
                value={timeRange}
                onChange={(nextRange) =>
                    onChange({ ...config, timeRange: nextRange })
                }
            >
                <MenuItem value='hour'>Last hour</MenuItem>
                <MenuItem value='day'>Last 24 hours</MenuItem>
                <MenuItem value='week'>Last 7 days</MenuItem>
                <MenuItem value='month'>Last 30 days</MenuItem>
            </RangeSelector>

            <Typography variant='h3'>Metrics</Typography>

            {steps.map((step, index) => (
                <StyledStepCard key={step.id}>
                    <StyledStepHeader>
                        <Typography variant='body2' fontWeight='bold'>
                            Metric {index + 1}
                        </Typography>
                        <StyledStepActions>
                            <IconButton
                                size='small'
                                onClick={() => moveStep(index, -1)}
                                disabled={index === 0}
                                aria-label='Move metric up'
                            >
                                <ArrowUpward fontSize='small' />
                            </IconButton>
                            <IconButton
                                size='small'
                                onClick={() => moveStep(index, 1)}
                                disabled={index === steps.length - 1}
                                aria-label='Move metric down'
                            >
                                <ArrowDownward fontSize='small' />
                            </IconButton>
                            <IconButton
                                size='small'
                                onClick={() => removeStep(index)}
                                disabled={steps.length <= MIN_STEPS}
                                aria-label='Remove metric'
                            >
                                <Delete fontSize='small' />
                            </IconButton>
                        </StyledStepActions>
                    </StyledStepHeader>

                    <TextField
                        label='Label'
                        value={step.label}
                        onChange={(event) =>
                            updateStep(index, { label: event.target.value })
                        }
                        fullWidth
                        variant='outlined'
                        size='small'
                        required
                    />

                    <StyledStepControls>
                        <Box sx={{ flex: 1 }}>
                            <MetricSelector
                                value={step.metricName}
                                valueSource={step.source}
                                onChange={(selection) => {
                                    const metricType = getMetricType(
                                        selection.metricName,
                                    );
                                    updateStep(index, {
                                        metricName: selection.metricName,
                                        source: selection.source,
                                        aggregationMode:
                                            metricType !== 'unknown'
                                                ? getDefaultAggregation(
                                                      metricType,
                                                  )
                                                : step.aggregationMode,
                                    });
                                }}
                                options={metrics}
                                loading={loading}
                                label={`Metric ${index + 1}`}
                            />
                        </Box>
                        <ModeSelector
                            value={step.aggregationMode}
                            onChange={(mode) =>
                                updateStep(index, { aggregationMode: mode })
                            }
                            metricType={getMetricType(step.metricName)}
                        />
                    </StyledStepControls>
                </StyledStepCard>
            ))}

            {steps.length < MAX_STEPS && (
                <Button
                    variant='outlined'
                    startIcon={<Add />}
                    onClick={addStep}
                    sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                >
                    Add metric
                </Button>
            )}

            <Typography variant='h3'>Feature events</Typography>
            <EnvironmentMultiSelect
                projectId={projectId}
                value={featureEventEnvironments}
                onChange={(envs) =>
                    onChange({ ...config, featureEventEnvironments: envs })
                }
            />
        </>
    );
};
