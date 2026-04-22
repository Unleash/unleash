import { useMemo, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { usePageTitle } from 'hooks/usePageTitle';
import {
    type ScheduledActionStatus,
    type ScheduledSequenceStatus,
    useReleaseAgentSequences,
} from 'hooks/api/getters/useReleaseAgent/useReleaseAgentSequences';
import { useReleaseAgentSequence } from 'hooks/api/getters/useReleaseAgent/useReleaseAgentSequence';

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

const Layout = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
}));

const formatTime = (iso: string): string => {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
};

export const SequencesPage = () => {
    usePageTitle('Release Agent · Sequences');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [project, setProject] = useState(
        searchParams.get('project') ?? 'default',
    );
    const [environment, setEnvironment] = useState(
        searchParams.get('environment') ?? 'development',
    );
    const [selectedId, setSelectedId] = useState<string | undefined>(
        searchParams.get('sequence') ?? undefined,
    );

    const {
        sequences,
        loading,
        error,
        refetch: refetchList,
    } = useReleaseAgentSequences(project, environment);

    const effectiveId = useMemo(() => {
        if (selectedId && sequences.some((s) => s.id === selectedId)) {
            return selectedId;
        }
        return sequences[0]?.id;
    }, [selectedId, sequences]);

    const { sequence: detail, refetch: refetchDetail } =
        useReleaseAgentSequence(effectiveId);

    const refetchAll = () => {
        refetchList();
        refetchDetail();
    };

    return (
        <PageContent
            header={
                <PageHeader
                    title='Release Agent · Sequences'
                    actions={
                        <Stack direction='row' spacing={1}>
                            <Button
                                variant='outlined'
                                size='small'
                                onClick={() => navigate('/release-agent')}
                            >
                                Back to author
                            </Button>
                            <Button
                                variant='outlined'
                                size='small'
                                onClick={refetchAll}
                            >
                                Refresh
                            </Button>
                        </Stack>
                    }
                />
            }
        >
            <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
                <TextField
                    size='small'
                    label='Project'
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                />
                <TextField
                    size='small'
                    label='Environment'
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                />
            </Stack>

            {error ? (
                <Typography color='error'>{String(error)}</Typography>
            ) : null}

            <Layout>
                <Paper variant='outlined'>
                    <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant='subtitle2'>
                            Sequences ({sequences.length})
                        </Typography>
                    </Box>
                    <Divider />
                    <List dense disablePadding>
                        {loading && sequences.length === 0 ? (
                            <Box sx={{ p: 2 }}>
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                >
                                    Loading…
                                </Typography>
                            </Box>
                        ) : null}
                        {!loading && sequences.length === 0 ? (
                            <Box sx={{ p: 2 }}>
                                <Typography
                                    variant='body2'
                                    color='text.secondary'
                                >
                                    No sequences for this project/environment.
                                </Typography>
                            </Box>
                        ) : null}
                        {sequences.map((sequence) => (
                            <ListItemButton
                                key={sequence.id}
                                selected={sequence.id === effectiveId}
                                onClick={() => setSelectedId(sequence.id)}
                            >
                                <ListItemText
                                    primary={
                                        <Stack
                                            direction='row'
                                            spacing={1}
                                            alignItems='center'
                                        >
                                            <Typography variant='body2'>
                                                {sequence.id.slice(-8)}
                                            </Typography>
                                            <Chip
                                                size='small'
                                                label={sequence.status}
                                                color={
                                                    sequenceStatusColor[
                                                        sequence.status
                                                    ]
                                                }
                                            />
                                        </Stack>
                                    }
                                    secondary={formatTime(sequence.createdAt)}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>

                <Box>
                    {detail ? (
                        <SequenceDetail
                            sequence={detail}
                            onChanged={refetchAll}
                        />
                    ) : (
                        <Paper variant='outlined' sx={{ p: 2 }}>
                            <Typography variant='body2' color='text.secondary'>
                                {effectiveId
                                    ? 'Loading sequence…'
                                    : 'Select a sequence to inspect it.'}
                            </Typography>
                        </Paper>
                    )}
                </Box>
            </Layout>
        </PageContent>
    );
};

const SequenceDetail = ({
    sequence,
    onChanged,
}: {
    sequence: NonNullable<
        ReturnType<typeof useReleaseAgentSequence>['sequence']
    >;
    onChanged: () => void;
}) => {
    const cancel = async () => {
        await fetch(`/api/admin/release-agent/sequences/${sequence.id}`, {
            method: 'DELETE',
        });
        onChanged();
    };

    return (
        <Paper variant='outlined' sx={{ p: 2 }}>
            <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                sx={{ mb: 1 }}
            >
                <Stack direction='row' spacing={1} alignItems='center'>
                    <Typography variant='h6'>{sequence.id}</Typography>
                    <Chip
                        size='small'
                        label={sequence.status}
                        color={sequenceStatusColor[sequence.status]}
                    />
                </Stack>
                {sequence.status === 'active' ? (
                    <Button
                        color='error'
                        variant='outlined'
                        size='small'
                        onClick={cancel}
                    >
                        Cancel
                    </Button>
                ) : null}
            </Stack>
            <Typography variant='body2' color='text.secondary'>
                {sequence.project} · {sequence.environment} · created{' '}
                {formatTime(sequence.createdAt)}
            </Typography>
            {sequence.prompt ? (
                <Paper
                    variant='outlined'
                    sx={{
                        p: 1,
                        mt: 1,
                        backgroundColor: 'background.default',
                    }}
                >
                    <Typography variant='caption' color='text.secondary'>
                        prompt
                    </Typography>
                    <Typography variant='body2'>{sequence.prompt}</Typography>
                </Paper>
            ) : null}

            <Divider sx={{ my: 2 }} />

            <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Actions ({sequence.actions?.length ?? 0})
            </Typography>
            <Stack spacing={1}>
                {(sequence.actions ?? []).map((action) => (
                    <Paper key={action.id} variant='outlined' sx={{ p: 1.5 }}>
                        <Stack
                            direction='row'
                            justifyContent='space-between'
                            alignItems='center'
                        >
                            <Stack
                                direction='row'
                                spacing={1}
                                alignItems='center'
                            >
                                <Typography variant='body2'>
                                    #{action.sortOrder} · {action.actionType}
                                </Typography>
                                <Chip
                                    size='small'
                                    label={action.status}
                                    color={actionStatusColor[action.status]}
                                />
                            </Stack>
                            <Typography
                                variant='caption'
                                color='text.secondary'
                            >
                                fires {formatTime(action.fireAt)}
                            </Typography>
                        </Stack>
                        <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ display: 'block', mt: 0.5 }}
                        >
                            feature: {action.featureName}
                            {action.ownedStrategyId
                                ? ` · owned strategy: ${action.ownedStrategyId}`
                                : ''}
                            {action.executedAt
                                ? ` · ran at ${formatTime(action.executedAt)}`
                                : ''}
                        </Typography>
                        {action.error ? (
                            <Typography
                                variant='caption'
                                color='error'
                                sx={{ display: 'block', mt: 0.5 }}
                            >
                                {action.error}
                            </Typography>
                        ) : null}
                        <Box
                            component='pre'
                            sx={{
                                m: 0,
                                mt: 1,
                                p: 1,
                                fontSize: 12,
                                overflow: 'auto',
                                backgroundColor: 'background.default',
                                borderRadius: 1,
                            }}
                        >
                            {JSON.stringify(action.payload, null, 2)}
                        </Box>
                    </Paper>
                ))}
            </Stack>
        </Paper>
    );
};
