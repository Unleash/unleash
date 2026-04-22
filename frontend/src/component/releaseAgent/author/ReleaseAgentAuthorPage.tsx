import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import SendIcon from '@mui/icons-material/ArrowUpwardOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from 'hooks/usePageTitle';
import {
    useReleaseAgentApi,
    type CompiledPreview,
} from 'hooks/api/actions/useReleaseAgentApi/useReleaseAgentApi';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { FeaturePicker } from './FeaturePicker.tsx';
import { SequencePreview } from './SequencePreview.tsx';

type ChatTurn =
    | { kind: 'user'; prompt: string; features: string[] }
    | { kind: 'agent'; preview: CompiledPreview }
    | { kind: 'error'; message: string };

const Container = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 120px)',
    maxWidth: 960,
    margin: '0 auto',
    padding: theme.spacing(2),
}));

const LandingHero = styled(Stack)(({ theme }) => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(6),
    textAlign: 'center',
}));

const HeroText = styled(Stack)(({ theme }) => ({
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const Title = styled(Typography)(({ theme }) => ({
    fontSize: '2rem',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
}));

const Scroll = styled(Box)(({ theme }) => ({
    flex: 1,
    marginBottom: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const UserBubble = styled(Paper)(({ theme }) => ({
    alignSelf: 'flex-end',
    maxWidth: '75%',
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(0.5),
}));

const AgentBubble = styled(Box)(({ theme }) => ({
    alignSelf: 'stretch',
    maxWidth: '100%',
}));

const ThinkingCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2, 2.5),
    borderRadius: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    color: theme.palette.text.secondary,
}));

const ThinkingDot = styled('span')(({ theme }) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    display: 'inline-block',
    animation: 'release-agent-thinking 1.2s infinite ease-in-out',
    '&:nth-of-type(2)': {
        animationDelay: '0.15s',
    },
    '&:nth-of-type(3)': {
        animationDelay: '0.3s',
    },
    '@keyframes release-agent-thinking': {
        '0%, 80%, 100%': { opacity: 0.25, transform: 'translateY(0)' },
        '40%': { opacity: 1, transform: 'translateY(-2px)' },
    },
}));

const Composer = styled(Paper)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: `0 12px 40px -20px ${theme.palette.secondary.border}, 0 2px 8px -4px ${theme.palette.divider}`,
}));

const ConfigBar = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 2.5),
    backgroundColor: theme.palette.secondary.light,
    borderBottom: `1px solid ${theme.palette.secondary.border}`,
}));

const PromptArea = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 2.5, 1.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

export const ReleaseAgentAuthorPage = () => {
    usePageTitle('Release agent');
    const navigate = useNavigate();
    const { compileSequence, commitSequence } = useReleaseAgentApi();

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

    const [project, setProject] = useState('default');
    const [environment, setEnvironment] = useState('development');

    useEffect(() => {
        if (
            projectOptions.length > 0 &&
            !projectOptions.some((p) => p.id === project)
        ) {
            setProject(projectOptions[0].id);
        }
    }, [projectOptions, project]);

    useEffect(() => {
        if (
            environmentOptions.length > 0 &&
            !environmentOptions.some((e) => e.name === environment)
        ) {
            setEnvironment(environmentOptions[0].name);
        }
    }, [environmentOptions, environment]);
    const [features, setFeatures] = useState<string[]>([]);
    const [prompt, setPrompt] = useState('');
    const [turns, setTurns] = useState<ChatTurn[]>([]);
    const [status, setStatus] = useState<'idle' | 'compiling' | 'committing'>(
        'idle',
    );
    const [committingId, setCommittingId] = useState<number | null>(null);

    const hasConversation = turns.length > 0;

    const latestPreviewIndex = useMemo(() => {
        for (let i = turns.length - 1; i >= 0; i -= 1) {
            const turn = turns[i];
            if (turn.kind === 'agent') return i;
        }
        return -1;
    }, [turns]);

    const canSend =
        status === 'idle' && features.length > 0 && prompt.trim().length > 0;

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth',
            });
        });
    };

    const send = async () => {
        if (!canSend) return;
        const userTurn: ChatTurn = {
            kind: 'user',
            prompt: prompt.trim(),
            features: [...features],
        };
        setTurns((prev) => [...prev, userTurn]);
        const currentPrompt = prompt.trim();
        setPrompt('');
        setStatus('compiling');
        scrollToBottom();

        try {
            const result = await compileSequence({
                project,
                environment,
                prompt: currentPrompt,
                features,
            });
            setTurns((prev) => [...prev, { kind: 'agent', preview: result }]);
        } catch (err: any) {
            setTurns((prev) => [
                ...prev,
                {
                    kind: 'error',
                    message:
                        err?.message ??
                        'Compile failed. Check the backend logs for details.',
                },
            ]);
        } finally {
            setStatus('idle');
            scrollToBottom();
        }
    };

    const commit = async (turnIndex: number) => {
        const turn = turns[turnIndex];
        if (!turn || turn.kind !== 'agent') return;
        const preview = turn.preview;
        setCommittingId(turnIndex);
        setStatus('committing');
        try {
            const created = await commitSequence({
                project: preview.project,
                environment: preview.environment,
                prompt: preview.prompt,
                model: preview.model,
                agentVersion: preview.agentVersion,
                actions: preview.actions,
                safeguards: preview.safeguards,
            });
            navigate(
                `/release-agent?project=${encodeURIComponent(project)}&environment=${encodeURIComponent(environment)}&sequence=${encodeURIComponent(created.id)}`,
            );
        } catch (err: any) {
            setTurns((prev) => [
                ...prev,
                {
                    kind: 'error',
                    message:
                        err?.message ??
                        'Commit failed. Check the backend logs for details.',
                },
            ]);
        } finally {
            setStatus('idle');
            setCommittingId(null);
        }
    };

    const context = (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: 'center' }}
        >
            <TextField
                select
                size='small'
                label='Project'
                value={project}
                onChange={(e) => {
                    setProject(e.target.value);
                    setFeatures([]);
                }}
                sx={{
                    minWidth: 160,
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
                    minWidth: 160,
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
            <Box sx={{ flex: 1, width: '100%' }}>
                <FeaturePicker
                    project={project}
                    value={features}
                    onChange={setFeatures}
                    disabled={status !== 'idle'}
                />
            </Box>
        </Stack>
    );

    const composer = (
        <Composer variant='outlined'>
            <ConfigBar>{context}</ConfigBar>
            <PromptArea>
                <TextField
                    fullWidth
                    multiline
                    minRows={hasConversation ? 1 : 2}
                    maxRows={8}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            send();
                        }
                    }}
                    placeholder={
                        features.length === 0
                            ? 'Pick one or more features above, then describe the rollout…'
                            : 'e.g. canary to 10/50/100% over five minutes, kill if error_rate_total exceeds 0.5/sec'
                    }
                    disabled={status !== 'idle'}
                    variant='standard'
                    InputProps={{ disableUnderline: true }}
                />
                <Stack
                    direction='row'
                    spacing={1}
                    justifyContent='space-between'
                    alignItems='center'
                >
                    <Typography variant='caption' color='text.secondary'>
                        ⌘⏎ to send
                    </Typography>
                    <IconButton
                        color='primary'
                        onClick={send}
                        disabled={!canSend}
                        size='small'
                        sx={{
                            backgroundColor: (t) =>
                                canSend
                                    ? t.palette.primary.main
                                    : 'transparent',
                            color: (t) =>
                                canSend
                                    ? t.palette.primary.contrastText
                                    : undefined,
                            '&:hover': {
                                backgroundColor: (t) =>
                                    canSend
                                        ? t.palette.primary.dark
                                        : undefined,
                            },
                        }}
                    >
                        {status === 'compiling' ? (
                            <CircularProgress size={18} />
                        ) : (
                            <SendIcon fontSize='small' />
                        )}
                    </IconButton>
                </Stack>
            </PromptArea>
        </Composer>
    );

    if (!hasConversation) {
        return (
            <Container>
                <LandingHero>
                    <HeroText>
                        <Title variant='h3'>
                            <AutoAwesomeIcon color='primary' />
                            Draft a release
                        </Title>
                        <Typography
                            variant='body1'
                            color='text.secondary'
                            sx={{ maxWidth: 520 }}
                        >
                            Pick the flags going into this rollout and describe
                            how you want them to ship. The release agent will
                            compile a concrete, time-scheduled plan you can
                            review before it goes live.
                        </Typography>
                    </HeroText>
                    <Box sx={{ width: '100%' }}>{composer}</Box>
                </LandingHero>
            </Container>
        );
    }

    return (
        <Container>
            <Scroll>
                {turns.map((turn, index) => {
                    if (turn.kind === 'user') {
                        return (
                            <Stack
                                key={`turn-${index}`}
                                spacing={0.5}
                                sx={{ alignItems: 'flex-end' }}
                            >
                                <UserBubble elevation={0}>
                                    <Typography variant='body2'>
                                        {turn.prompt}
                                    </Typography>
                                </UserBubble>
                                <Typography
                                    variant='caption'
                                    color='text.secondary'
                                >
                                    for {turn.features.join(', ')}
                                </Typography>
                            </Stack>
                        );
                    }
                    if (turn.kind === 'error') {
                        return (
                            <Alert severity='error' key={`turn-${index}`}>
                                {turn.message}
                            </Alert>
                        );
                    }
                    return (
                        <AgentBubble key={`turn-${index}`}>
                            <SequencePreview
                                preview={turn.preview}
                                onCommit={() => commit(index)}
                                committing={
                                    committingId === index &&
                                    status === 'committing'
                                }
                                committable={
                                    latestPreviewIndex === index &&
                                    status !== 'committing'
                                }
                            />
                        </AgentBubble>
                    );
                })}
                {status === 'compiling' ? (
                    <AgentBubble>
                        <ThinkingCard variant='outlined'>
                            <AutoAwesomeIcon color='primary' fontSize='small' />
                            <Typography variant='body2'>
                                Drafting your release plan
                            </Typography>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    gap: 0.5,
                                    ml: 0.5,
                                }}
                            >
                                <ThinkingDot />
                                <ThinkingDot />
                                <ThinkingDot />
                            </Box>
                        </ThinkingCard>
                    </AgentBubble>
                ) : null}
            </Scroll>
            {composer}
        </Container>
    );
};
