import { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import PowerIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import RocketIcon from '@mui/icons-material/RocketLaunchOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import DeleteActionIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

const pickSteps = (
    actions: ScheduledAction[],
): { kind: ReleaseStepKind; action: ScheduledAction }[] => {
    const sorted = [...(actions ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
    );
    const nextPending = sorted.find((a) => a.status === 'pending');
    const executed = sorted.filter((a) => a.status !== 'pending');
    const latestRan = executed[executed.length - 1];

    const steps: { kind: ReleaseStepKind; action: ScheduledAction }[] = [];
    if (latestRan) {
        steps.push({
            kind: nextPending ? 'current' : 'done',
            action: latestRan,
        });
    }
    if (nextPending) {
        steps.push({ kind: 'next', action: nextPending });
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
    const steps = pickSteps(actions);
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
                        steps.map(({ kind, action }) => (
                            <StepBlock key={`${action.id}-${kind}`}>
                                <Box sx={{ mt: 0.25, color: 'text.secondary' }}>
                                    {actionIcon(action)}
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
                                        {formatRelative(action.fireAt, now)}
                                    </Typography>
                                    <Typography variant='body2'>
                                        {describeAction(action)}
                                    </Typography>
                                    {action.error ? (
                                        <Typography
                                            variant='caption'
                                            color='error'
                                        >
                                            {action.error}
                                        </Typography>
                                    ) : null}
                                </Stack>
                                <Chip
                                    size='small'
                                    label={action.status}
                                    color={actionStatusColor[action.status]}
                                    variant='outlined'
                                />
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

    const [project, setProject] = useState(
        searchParams.get('project') ?? 'default',
    );
    const [environment, setEnvironment] = useState(
        searchParams.get('environment') ?? 'development',
    );
    const selectedId = searchParams.get('sequence') ?? undefined;

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
                    size='small'
                    label='Project'
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    sx={{ minWidth: 180 }}
                />
                <TextField
                    size='small'
                    label='Environment'
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    sx={{ minWidth: 180 }}
                />
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
            <DialogTitle sx={{ pb: 1 }}>
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
                        <Typography variant='h6' noWrap>
                            Release {sequence.id.slice(-8)}
                        </Typography>
                        <Chip
                            size='small'
                            label={sequence.status}
                            color={sequenceStatusColor[sequence.status]}
                        />
                    </Stack>
                    <IconButton size='small' onClick={onClose}>
                        <CloseIcon fontSize='small' />
                    </IconButton>
                </Stack>
                <Typography variant='caption' color='text.secondary'>
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
                            backgroundColor: 'background.default',
                        }}
                    >
                        <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ textTransform: 'uppercase' }}
                        >
                            prompt
                        </Typography>
                        <Typography variant='body2' sx={{ mt: 0.5 }}>
                            {sequence.prompt}
                        </Typography>
                    </Paper>
                ) : null}

                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                    Actions ({sequence.actions?.length ?? 0})
                </Typography>
                <Stack spacing={1}>
                    {(sequence.actions ?? [])
                        .slice()
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((action) => (
                            <Paper
                                key={action.id}
                                variant='outlined'
                                sx={{ p: 1.5 }}
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
                                    >
                                        {actionIcon(action)}
                                        <Typography variant='body2'>
                                            #{action.sortOrder} ·{' '}
                                            {describeAction(action)}
                                        </Typography>
                                    </Stack>
                                    <Stack
                                        direction='row'
                                        spacing={1}
                                        alignItems='center'
                                    >
                                        <Typography
                                            variant='caption'
                                            color='text.secondary'
                                        >
                                            fires {formatTime(action.fireAt)}
                                        </Typography>
                                        <Chip
                                            size='small'
                                            label={action.status}
                                            color={
                                                actionStatusColor[action.status]
                                            }
                                            variant='outlined'
                                        />
                                    </Stack>
                                </Stack>
                                {action.error ? (
                                    <Typography
                                        variant='caption'
                                        color='error'
                                        sx={{ display: 'block', mt: 0.5 }}
                                    >
                                        {action.error}
                                    </Typography>
                                ) : null}
                            </Paper>
                        ))}
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
