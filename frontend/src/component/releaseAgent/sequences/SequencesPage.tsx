import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    LinearProgress,
    Link,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreOutlined';
import PowerIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import RocketIcon from '@mui/icons-material/RocketLaunchOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import DeleteActionIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import {
    Link as RouterLink,
    useNavigate,
    useSearchParams,
} from 'react-router-dom';
import { usePageTitle } from 'hooks/usePageTitle';
import {
    type ScheduledAction,
    type ScheduledActionStatus,
    type ScheduledSequence,
    type ScheduledSequenceStatus,
    useReleaseAgentSequences,
} from 'hooks/api/getters/useReleaseAgent/useReleaseAgentSequences';
import { useReleaseAgentSequence } from 'hooks/api/getters/useReleaseAgent/useReleaseAgentSequence';
import { useReleaseAgentApi } from 'hooks/api/actions/useReleaseAgentApi/useReleaseAgentApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';

const sequenceStatusColor: Record<
    ScheduledSequenceStatus,
    'default' | 'primary' | 'success' | 'warning' | 'error'
> = {
    active: 'primary',
    completed: 'success',
    cancelled: 'default',
    conflicted: 'warning',
};

const actionStatusColor: Record<
    ScheduledActionStatus,
    'default' | 'primary' | 'success' | 'warning' | 'error'
> = {
    pending: 'default',
    executed: 'success',
    failed: 'error',
    skipped: 'warning',
};

const Page = styled(Box)(({ theme }) => ({
    maxWidth: 1100,
    margin: '0 auto',
    padding: theme.spacing(3),
}));

const HeaderRow = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(3),
    gap: theme.spacing(2),
    flexWrap: 'wrap',
}));

const FiltersRow = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    gap: theme.spacing(1.5),
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
}));

const Grid = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const ReleaseCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(1.5),
    cursor: 'pointer',
    transition: theme.transitions.create(
        ['box-shadow', 'transform', 'border-color'],
        {
            duration: 180,
        },
    ),
    '&:hover': {
        borderColor: theme.palette.secondary.border,
        boxShadow: `0 8px 24px -16px ${theme.palette.secondary.border}`,
    },
}));

const StepBlock = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.25, 1.5),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
}));

const EmptyState = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(6, 3),
    textAlign: 'center',
    borderRadius: theme.spacing(2),
    border: `1px dashed ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
}));

const StatusPill = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: ScheduledActionStatus }>(({ theme, status }) => {
    const palette =
        status === 'executed'
            ? theme.palette.success
            : status === 'failed'
              ? theme.palette.error
              : status === 'skipped'
                ? theme.palette.warning
                : null;
    if (!palette) {
        return {
            display: 'inline-flex',
            alignItems: 'center',
            padding: theme.spacing(0.25, 1),
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1.5,
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.secondary,
            border: `1px solid ${theme.palette.divider}`,
        };
    }
    return {
        display: 'inline-flex',
        alignItems: 'center',
        padding: theme.spacing(0.25, 1),
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.5,
        backgroundColor: palette.light,
        color: palette.dark,
        border: `1px solid ${palette.border}`,
    };
});

const StatusChip = ({ status }: { status: ScheduledActionStatus }) => (
    <StatusPill status={status}>{status}</StatusPill>
);

const CodeBlock = styled(Box)(({ theme }) => ({
    margin: 0,
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.25),
    fontSize: 11.5,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    overflow: 'auto',
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(0.75),
    whiteSpace: 'pre',
}));

const ExpandButton = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ theme, expanded }) => ({
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: theme.transitions.create('transform', { duration: 200 }),
}));

type DetailStepProps = {
    group: StepGroup;
    index: number;
    project: string;
};

const DetailStep = ({ group, index, project }: DetailStepProps) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <Paper variant='outlined' sx={{ p: 1.5 }}>
            <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='flex-start'
                spacing={1}
            >
                <Stack
                    direction='row'
                    spacing={1}
                    alignItems='flex-start'
                    sx={{ minWidth: 0, flex: 1 }}
                >
                    <Box sx={{ mt: 0.25 }}>{actionIcon(group.sample)}</Box>
                    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                        <Typography variant='body2'>
                            #{index + 1} ·{' '}
                            {describeGroup(
                                group.actionType,
                                group.sample,
                                group.features,
                            )}
                        </Typography>
                        <Stack
                            direction='row'
                            spacing={0.5}
                            flexWrap='wrap'
                            useFlexGap
                            sx={{ alignItems: 'center' }}
                        >
                            {group.features.map((feature) => (
                                <Link
                                    key={feature}
                                    component={RouterLink}
                                    to={`/projects/${encodeURIComponent(project)}/features/${encodeURIComponent(feature)}`}
                                    variant='caption'
                                    underline='hover'
                                    sx={{
                                        fontFamily:
                                            'ui-monospace, SFMono-Regular, Menlo, monospace',
                                    }}
                                >
                                    {feature}
                                </Link>
                            ))}
                            {group.features.length > 1 ? (
                                <Typography
                                    variant='caption'
                                    color='text.secondary'
                                >
                                    · batched same-minute
                                </Typography>
                            ) : null}
                        </Stack>
                    </Stack>
                </Stack>
                <Stack
                    direction='row'
                    spacing={1}
                    alignItems='center'
                    sx={{ flexShrink: 0 }}
                >
                    <Typography variant='caption' color='text.secondary'>
                        fires {formatTime(group.fireAt)}
                    </Typography>
                    <StatusChip status={group.status} />
                    <ExpandButton
                        expanded={expanded}
                        size='small'
                        onClick={() => setExpanded((v) => !v)}
                        aria-label={expanded ? 'Hide JSON' : 'Show JSON'}
                    >
                        <ExpandMoreIcon fontSize='small' />
                    </ExpandButton>
                </Stack>
            </Stack>
            {group.error ? (
                <Typography
                    variant='caption'
                    color='error'
                    sx={{ display: 'block', mt: 0.5 }}
                >
                    {group.error}
                </Typography>
            ) : null}
            <Collapse in={expanded} unmountOnExit>
                <CodeBlock component='pre'>
                    {JSON.stringify(
                        {
                            actionType: group.actionType,
                            fireAt: group.fireAt,
                            features: group.features,
                            payload: group.sample.payload,
                        },
                        null,
                        2,
                    )}
                </CodeBlock>
            </Collapse>
        </Paper>
    );
};

const formatTime = (iso: string): string => {
    try {
        return new Date(iso).toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return iso;
    }
};

const formatRelative = (iso: string, now: Date): string => {
    try {
        const then = new Date(iso).getTime();
        const diff = Math.round((then - now.getTime()) / 1000);
        const abs = Math.abs(diff);
        const fmt = (n: number, unit: string) =>
            `${n}${unit}${diff < 0 ? ' ago' : ''}`;
        if (abs < 60) return diff < 0 ? `${abs}s ago` : `in ${abs}s`;
        if (abs < 3600)
            return diff < 0
                ? `${Math.round(abs / 60)}m ago`
                : `in ${Math.round(abs / 60)}m`;
        if (abs < 86400)
            return diff < 0
                ? `${Math.round(abs / 3600)}h ago`
                : `in ${Math.round(abs / 3600)}h`;
        return fmt(Math.round(abs / 86400), 'd');
    } catch {
        return '';
    }
};

const describeAction = (action: ScheduledAction): string => {
    switch (action.actionType) {
        case 'strategy.create': {
            const payload = action.payload as {
                strategyName?: string;
                parameters?: Record<string, unknown>;
            };
            if (payload.strategyName === 'flexibleRollout') {
                const rollout = payload.parameters?.rollout as
                    | string
                    | undefined;
                return rollout
                    ? `Create rollout at ${rollout}% for ${action.featureName}`
                    : `Create strategy for ${action.featureName}`;
            }
            return `Create ${payload.strategyName ?? 'strategy'} for ${action.featureName}`;
        }
        case 'strategy.update': {
            const payload = action.payload as {
                patch?: { parameters?: Record<string, unknown> };
            };
            const rollout = payload.patch?.parameters?.rollout as
                | string
                | undefined;
            return rollout
                ? `Ramp ${action.featureName} to ${rollout}%`
                : `Update strategy for ${action.featureName}`;
        }
        case 'strategy.delete':
            return `Remove strategy from ${action.featureName}`;
        case 'feature_environment.setEnabled': {
            const payload = action.payload as { enabled?: boolean };
            return payload.enabled
                ? `Enable ${action.featureName}`
                : `Disable ${action.featureName}`;
        }
        default:
            return `${action.actionType} on ${action.featureName}`;
    }
};

const formatFeatureList = (features: string[]): string => {
    if (features.length === 0) return '';
    if (features.length === 1) return features[0];
    if (features.length === 2) return `${features[0]} and ${features[1]}`;
    const head = features.slice(0, -1).join(', ');
    return `${head}, and ${features[features.length - 1]}`;
};

const describeGroup = (
    actionType: ScheduledAction['actionType'],
    sample: ScheduledAction,
    features: string[],
): string => {
    const who = formatFeatureList(features);
    switch (actionType) {
        case 'strategy.create': {
            const payload = sample.payload as {
                strategyName?: string;
                parameters?: Record<string, unknown>;
            };
            if (payload.strategyName === 'flexibleRollout') {
                const rollout = payload.parameters?.rollout as
                    | string
                    | undefined;
                return rollout
                    ? `Create rollout at ${rollout}% for ${who}`
                    : `Create strategy for ${who}`;
            }
            return `Create ${payload.strategyName ?? 'strategy'} for ${who}`;
        }
        case 'strategy.update': {
            const payload = sample.payload as {
                patch?: { parameters?: Record<string, unknown> };
            };
            const rollout = payload.patch?.parameters?.rollout as
                | string
                | undefined;
            return rollout
                ? `Ramp ${who} to ${rollout}%`
                : `Update strategy on ${who}`;
        }
        case 'strategy.delete':
            return `Remove strategy from ${who}`;
        case 'feature_environment.setEnabled': {
            const payload = sample.payload as { enabled?: boolean };
            return payload.enabled ? `Enable ${who}` : `Disable ${who}`;
        }
        default:
            return `${actionType} on ${who}`;
    }
};

const actionIcon = (action: ScheduledAction) => {
    switch (action.actionType) {
        case 'strategy.create':
            return <RocketIcon fontSize='small' />;
        case 'strategy.update':
            return <TuneIcon fontSize='small' />;
        case 'strategy.delete':
            return <DeleteActionIcon fontSize='small' />;
        case 'feature_environment.setEnabled':
            return <PowerIcon fontSize='small' />;
        default:
            return <TuneIcon fontSize='small' />;
    }
};

type ReleaseStepKind = 'next' | 'current' | 'done';

const stepLabel: Record<ReleaseStepKind, string> = {
    current: 'Just ran',
    next: 'Up next',
    done: 'Last step',
};

type StepGroup = {
    actionType: ScheduledAction['actionType'];
    sample: ScheduledAction;
    features: string[];
    fireAt: string;
    status: ScheduledActionStatus;
    error?: string | null;
};

const groupKey = (action: ScheduledAction): string => {
    const minute = Math.floor(new Date(action.fireAt).getTime() / 60_000);
    const payload = action.payload as {
        strategyName?: string;
        parameters?: { rollout?: unknown };
        patch?: { parameters?: { rollout?: unknown } };
        enabled?: boolean;
    };
    const signature =
        action.actionType === 'strategy.create'
            ? `${payload.strategyName ?? ''}:${payload.parameters?.rollout ?? ''}`
            : action.actionType === 'strategy.update'
              ? `update:${payload.patch?.parameters?.rollout ?? ''}`
              : action.actionType === 'feature_environment.setEnabled'
                ? `enabled:${payload.enabled}`
                : action.actionType === 'strategy.delete'
                  ? 'delete'
                  : action.actionType;
    return `${minute}|${action.actionType}|${signature}|${action.status}`;
};

const groupActions = (actions: ScheduledAction[]): StepGroup[] => {
    const sorted = [...(actions ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
    );
    const groups = new Map<string, StepGroup>();
    for (const action of sorted) {
        const key = groupKey(action);
        const existing = groups.get(key);
        if (existing) {
            if (!existing.features.includes(action.featureName)) {
                existing.features.push(action.featureName);
            }
            if (action.error && !existing.error) {
                existing.error = action.error;
            }
        } else {
            groups.set(key, {
                actionType: action.actionType,
                sample: action,
                features: [action.featureName],
                fireAt: action.fireAt,
                status: action.status,
                error: action.error ?? undefined,
            });
        }
    }
    return Array.from(groups.values());
};

const pickStepGroups = (
    actions: ScheduledAction[],
): { kind: ReleaseStepKind; group: StepGroup }[] => {
    const groups = groupActions(actions);
    const pending = groups.filter((g) => g.status === 'pending');
    const executed = groups.filter((g) => g.status !== 'pending');
    const nextPending = pending[0];
    const latestRan = executed[executed.length - 1];

    const steps: { kind: ReleaseStepKind; group: StepGroup }[] = [];
    if (latestRan) {
        steps.push({
            kind: nextPending ? 'current' : 'done',
            group: latestRan,
        });
    }
    if (nextPending) {
        steps.push({ kind: 'next', group: nextPending });
    }
    return steps;
};

const featureNames = (actions: ScheduledAction[]): string[] => {
    const set = new Set<string>();
    for (const a of actions ?? []) set.add(a.featureName);
    return Array.from(set);
};

type CardProps = {
    sequence: ScheduledSequence;
    onOpen: () => void;
};

const ReleaseCardView = ({ sequence, onOpen }: CardProps) => {
    const actions = sequence.actions ?? [];
    const now = new Date();
    const steps = pickStepGroups(actions);
    const features = featureNames(actions);
    const completed = actions.filter(
        (a) => a.status === 'executed' || a.status === 'skipped',
    ).length;
    const total = actions.length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <ReleaseCard variant='outlined' onClick={onOpen}>
            <Stack spacing={1.5}>
                <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='flex-start'
                    spacing={1}
                >
                    <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {sequence.prompt ??
                                `Release ${sequence.id.slice(-6)}`}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                            {sequence.environment} · started{' '}
                            {formatTime(sequence.createdAt)}
                        </Typography>
                    </Stack>
                    <Chip
                        size='small'
                        label={sequence.status}
                        color={sequenceStatusColor[sequence.status]}
                    />
                </Stack>

                {features.length > 0 ? (
                    <Stack
                        direction='row'
                        spacing={0.5}
                        flexWrap='wrap'
                        useFlexGap
                    >
                        {features.map((f) => (
                            <Chip
                                key={f}
                                size='small'
                                label={f}
                                variant='outlined'
                                clickable
                                component={RouterLink}
                                to={`/projects/${encodeURIComponent(sequence.project)}/features/${encodeURIComponent(f)}`}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ))}
                    </Stack>
                ) : null}

                <LinearProgress
                    variant='determinate'
                    value={progress}
                    sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography variant='caption' color='text.secondary'>
                    {completed} of {total} steps complete
                </Typography>

                <Stack spacing={1}>
                    {steps.length === 0 ? (
                        <Typography variant='body2' color='text.secondary'>
                            No steps to show.
                        </Typography>
                    ) : (
                        steps.map(({ kind, group }) => (
                            <StepBlock key={`${group.sample.id}-${kind}`}>
                                <Box sx={{ mt: 0.25, color: 'text.secondary' }}>
                                    {actionIcon(group.sample)}
                                </Box>
                                <Stack
                                    sx={{ flex: 1, minWidth: 0 }}
                                    spacing={0.25}
                                >
                                    <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        sx={{
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.6,
                                        }}
                                    >
                                        {stepLabel[kind]} ·{' '}
                                        {formatRelative(group.fireAt, now)}
                                        {group.features.length > 1
                                            ? ` · ${group.features.length} flags`
                                            : ''}
                                    </Typography>
                                    <Typography variant='body2'>
                                        {describeGroup(
                                            group.actionType,
                                            group.sample,
                                            group.features,
                                        )}
                                    </Typography>
                                    {group.error ? (
                                        <Typography
                                            variant='caption'
                                            color='error'
                                        >
                                            {group.error}
                                        </Typography>
                                    ) : null}
                                </Stack>
                                <StatusChip status={group.status} />
                            </StepBlock>
                        ))
                    )}
                </Stack>
            </Stack>
        </ReleaseCard>
    );
};

export const SequencesPage = () => {
    usePageTitle('Releases');
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const { projects } = useProjects();
    const { environments } = useEnvironments();
    const projectOptions = useMemo(
        () => projects.map((p) => ({ id: p.id, name: p.name ?? p.id })),
        [projects],
    );
    const environmentOptions = useMemo(
        () => environments.filter((e) => e.enabled !== false),
        [environments],
    );

    const [project, setProject] = useState(
        searchParams.get('project') ?? 'default',
    );
    const [environment, setEnvironment] = useState(
        searchParams.get('environment') ?? 'development',
    );
    const selectedId = searchParams.get('sequence') ?? undefined;

    useEffect(() => {
        if (
            projectOptions.length > 0 &&
            !projectOptions.some((p) => p.id === project) &&
            !searchParams.get('project')
        ) {
            setProject(projectOptions[0].id);
        }
    }, [projectOptions, project, searchParams]);

    useEffect(() => {
        if (
            environmentOptions.length > 0 &&
            !environmentOptions.some((e) => e.name === environment) &&
            !searchParams.get('environment')
        ) {
            setEnvironment(environmentOptions[0].name);
        }
    }, [environmentOptions, environment, searchParams]);

    const { sequences, loading, error, refetch } = useReleaseAgentSequences(
        project,
        environment,
    );

    const { active, recent } = useMemo(() => {
        const sortedByCreated = [...sequences].sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        );
        const hasPending = (s: ScheduledSequence) =>
            (s.actions ?? []).some((a) => a.status === 'pending');
        return {
            active: sortedByCreated.filter(
                (s) => s.status === 'active' && hasPending(s),
            ),
            recent: sortedByCreated.filter(
                (s) => s.status !== 'active' || !hasPending(s),
            ),
        };
    }, [sequences]);

    const openSequence = (id: string) => {
        const next = new URLSearchParams(searchParams);
        next.set('sequence', id);
        setSearchParams(next);
    };

    const closeSequence = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('sequence');
        setSearchParams(next);
    };

    return (
        <Page>
            <HeaderRow>
                <Stack spacing={0.5}>
                    <Typography variant='h4' sx={{ fontWeight: 500 }}>
                        Releases
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        Agent-drafted rollouts in flight and recent history.
                    </Typography>
                </Stack>
                <Stack direction='row' spacing={1}>
                    <IconButton onClick={refetch} size='small' title='Refresh'>
                        <RefreshIcon fontSize='small' />
                    </IconButton>
                    <Button
                        variant='contained'
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/release-agent/new')}
                    >
                        Draft release
                    </Button>
                </Stack>
            </HeaderRow>

            <FiltersRow>
                <TextField
                    select
                    size='small'
                    label='Project'
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    sx={{
                        minWidth: 200,
                        '& .MuiSelect-select': { textAlign: 'left' },
                    }}
                >
                    {projectOptions.length === 0 ? (
                        <MenuItem value={project}>{project}</MenuItem>
                    ) : null}
                    {projectOptions.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                            {p.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    size='small'
                    label='Environment'
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    sx={{
                        minWidth: 200,
                        '& .MuiSelect-select': { textAlign: 'left' },
                    }}
                >
                    {environmentOptions.length === 0 ? (
                        <MenuItem value={environment}>{environment}</MenuItem>
                    ) : null}
                    {environmentOptions.map((env) => (
                        <MenuItem key={env.name} value={env.name}>
                            {env.name}
                        </MenuItem>
                    ))}
                </TextField>
            </FiltersRow>

            {error ? (
                <Alert severity='error' sx={{ mb: 2 }}>
                    {String(error)}
                </Alert>
            ) : null}

            {loading && sequences.length === 0 ? (
                <Stack
                    direction='row'
                    alignItems='center'
                    spacing={1}
                    sx={{ mb: 3 }}
                >
                    <CircularProgress size={16} />
                    <Typography variant='body2' color='text.secondary'>
                        Loading releases…
                    </Typography>
                </Stack>
            ) : null}

            {!loading && sequences.length === 0 ? (
                <EmptyState>
                    <Stack spacing={2} alignItems='center'>
                        <AutoAwesomeIcon color='primary' fontSize='large' />
                        <Stack spacing={0.5} alignItems='center'>
                            <Typography variant='h6'>
                                No releases yet
                            </Typography>
                            <Typography
                                variant='body2'
                                color='text.secondary'
                                sx={{ maxWidth: 380 }}
                            >
                                Draft your first release by describing how you
                                want your flags to ship.
                            </Typography>
                        </Stack>
                        <Button
                            variant='contained'
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/release-agent/new')}
                        >
                            Draft release
                        </Button>
                    </Stack>
                </EmptyState>
            ) : null}

            {active.length > 0 ? (
                <>
                    <Typography
                        variant='overline'
                        color='text.secondary'
                        sx={{ letterSpacing: 1 }}
                    >
                        In flight · {active.length}
                    </Typography>
                    <Grid sx={{ mt: 1, mb: 3 }}>
                        {active.map((seq) => (
                            <ReleaseCardView
                                key={seq.id}
                                sequence={seq}
                                onOpen={() => openSequence(seq.id)}
                            />
                        ))}
                    </Grid>
                </>
            ) : null}

            {recent.length > 0 ? (
                <>
                    <Typography
                        variant='overline'
                        color='text.secondary'
                        sx={{ letterSpacing: 1 }}
                    >
                        Recent · {recent.length}
                    </Typography>
                    <Grid sx={{ mt: 1 }}>
                        {recent.map((seq) => (
                            <ReleaseCardView
                                key={seq.id}
                                sequence={seq}
                                onOpen={() => openSequence(seq.id)}
                            />
                        ))}
                    </Grid>
                </>
            ) : null}

            <Dialog
                open={Boolean(selectedId)}
                onClose={closeSequence}
                maxWidth='md'
                fullWidth
            >
                {selectedId ? (
                    <SequenceDetailDialog
                        sequenceId={selectedId}
                        onClose={closeSequence}
                        onChanged={refetch}
                    />
                ) : null}
            </Dialog>
        </Page>
    );
};

type DetailProps = {
    sequenceId: string;
    onClose: () => void;
    onChanged: () => void;
};

const SequenceDetailDialog = ({
    sequenceId,
    onClose,
    onChanged,
}: DetailProps) => {
    const { sequence, refetch } = useReleaseAgentSequence(sequenceId);
    const { cancelSequence } = useReleaseAgentApi();

    const cancel = async () => {
        try {
            await cancelSequence(sequenceId);
            await refetch();
            onChanged();
        } catch (err) {
            console.warn('Failed to cancel sequence', err);
        }
    };

    if (!sequence) {
        return (
            <DialogContent>
                <Stack direction='row' alignItems='center' spacing={1}>
                    <CircularProgress size={16} />
                    <Typography variant='body2'>Loading release…</Typography>
                </Stack>
            </DialogContent>
        );
    }

    return (
        <>
            <DialogTitle
                sx={{
                    pb: 1.5,
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                }}
            >
                <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='center'
                    spacing={1}
                >
                    <Stack
                        direction='row'
                        spacing={1}
                        alignItems='center'
                        sx={{ minWidth: 0 }}
                    >
                        <Typography variant='h6' noWrap color='inherit'>
                            Release {sequence.id.slice(-8)}
                        </Typography>
                        <Chip
                            size='small'
                            label={sequence.status}
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'primary.contrastText',
                                border: 'none',
                            }}
                        />
                    </Stack>
                    <IconButton
                        size='small'
                        onClick={onClose}
                        sx={{ color: 'inherit' }}
                    >
                        <CloseIcon fontSize='small' />
                    </IconButton>
                </Stack>
                <Typography
                    variant='caption'
                    color='inherit'
                    sx={{ opacity: 0.85 }}
                >
                    {sequence.project} · {sequence.environment} · created{' '}
                    {formatTime(sequence.createdAt)}
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                {sequence.prompt ? (
                    <Paper
                        variant='outlined'
                        sx={{
                            p: 1.5,
                            mb: 2,
                            backgroundColor: 'secondary.light',
                            borderColor: 'secondary.border',
                        }}
                    >
                        <Typography
                            variant='caption'
                            sx={{
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                color: 'secondary.dark',
                                fontWeight: 600,
                            }}
                        >
                            prompt
                        </Typography>
                        <Typography
                            variant='body2'
                            sx={{ mt: 0.5, color: 'secondary.dark' }}
                        >
                            {sequence.prompt}
                        </Typography>
                    </Paper>
                ) : null}

                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                    Steps ({groupActions(sequence.actions ?? []).length})
                </Typography>
                <Stack spacing={1}>
                    {groupActions(sequence.actions ?? []).map(
                        (group, index) => (
                            <DetailStep
                                key={`${group.sample.id}-${index}`}
                                group={group}
                                index={index}
                                project={sequence.project}
                            />
                        ),
                    )}
                </Stack>

                {sequence.status === 'active' ? (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction='row' justifyContent='flex-end'>
                            <Button
                                size='small'
                                color='error'
                                variant='outlined'
                                onClick={cancel}
                            >
                                Cancel release
                            </Button>
                        </Stack>
                    </>
                ) : null}
            </DialogContent>
        </>
    );
};
