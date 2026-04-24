import { Fragment, useState } from 'react';
import {
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography,
    styled,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { Markdown } from 'component/common/Markdown/Markdown';
import useToast from 'hooks/useToast';
import {
    type AiAgent,
    useAiAgents,
} from 'hooks/api/getters/useAiAgents/useAiAgents';
import { useUiFlag } from 'hooks/useUiFlag';

const BadgeButton = styled(IconButton)(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(0.5),
}));

const StatusDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'live',
})<{ live: boolean }>(({ theme, live }) => ({
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: live
        ? theme.palette.success.main
        : theme.palette.neutral.border,
    border: `2px solid ${theme.palette.background.paper}`,
}));

const AgentEntry = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 0),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': { borderBottom: 'none' },
}));

const AgentHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
}));

const InlineDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'live',
})<{ live: boolean }>(({ theme, live }) => ({
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: live
        ? theme.palette.success.main
        : theme.palette.neutral.border,
}));

const EventList = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(0.75),
    paddingLeft: theme.spacing(2),
    borderLeft: `2px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
}));

const MarkdownBody = styled('div')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.primary,
    overflowWrap: 'anywhere',
    '& p': { margin: theme.spacing(0.25, 0) },
    '& ul, & ol': {
        margin: theme.spacing(0.25, 0),
        paddingLeft: theme.spacing(2.5),
    },
    '& code': {
        backgroundColor: theme.palette.action.hover,
        padding: '0 4px',
        borderRadius: 3,
        fontSize: '0.85em',
    },
    '& pre': {
        backgroundColor: theme.palette.action.hover,
        padding: theme.spacing(1),
        borderRadius: 4,
        overflow: 'auto',
    },
}));

type AiAgentsBadgeProps = {
    type: string;
    label?: string;
};

const renderAgentName = (agent: AiAgent) =>
    agent.displayName || agent.externalId;

export const AiAgentsBadge = ({ type, label }: AiAgentsBadgeProps) => {
    const aiAgentsEnabled = useUiFlag('aiAgents');
    const { agents, loading } = useAiAgents({ type });
    const { setToastData } = useToast();
    const [open, setOpen] = useState(false);
    const [revertedEventIds, setRevertedEventIds] = useState<Set<number>>(
        new Set(),
    );

    const handleRevertEvent = (eventId: number) => {
        setRevertedEventIds((prev) => {
            const next = new Set(prev);
            next.add(eventId);
            return next;
        });
        setToastData({
            text: 'Action reverted (demo only)',
            type: 'success',
        });
    };

    if (!aiAgentsEnabled) return null;

    // Demo-only: deterministic 50/50 split — same event always lands on the
    // same side across renders. Action events can be reverted; Info cannot.
    const eventKind = (eventId: number): 'action' | 'info' =>
        eventId % 2 === 0 ? 'action' : 'info';

    const liveCount = agents.filter((a) => a.isLive).length;
    const anyLive = liveCount > 0;
    const titleText = label ?? `AI agents (${type})`;
    const tooltipText = loading
        ? `Loading ${titleText}…`
        : agents.length === 0
            ? `No AI agents registered for "${type}"`
            : `${agents.length} AI agent${agents.length === 1 ? '' : 's'} · ${liveCount} live`;

    return (
        <Fragment>
            <Tooltip title={tooltipText} arrow>
                <BadgeButton
                    size='small'
                    aria-label={`Show AI agents for ${type}`}
                    onClick={() => setOpen(true)}
                >
                    <AutoAwesomeIcon fontSize='small' />
                    <StatusDot live={anyLive} />
                </BadgeButton>
            </Tooltip>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        pr: 6,
                    }}
                >
                    <AutoAwesomeIcon fontSize='small' />
                    {titleText}
                    <IconButton
                        aria-label='Close'
                        onClick={() => setOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                        size='small'
                    >
                        <CloseIcon fontSize='small' />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {agents.length === 0 ? (
                        <Typography color='text.secondary'>
                            No AI agents have reported with type{' '}
                            <code>{type}</code> yet.
                        </Typography>
                    ) : (
                        agents.map((agent) => (
                            <AgentEntry key={agent.id}>
                                <AgentHeader>
                                    <Tooltip
                                        title={
                                            agent.isLive
                                                ? 'Live (heartbeat in last 30 min)'
                                                : 'Idle'
                                        }
                                        arrow
                                    >
                                        <InlineDot live={agent.isLive} />
                                    </Tooltip>
                                    <Typography
                                        variant='subtitle2'
                                        sx={{ flex: 1 }}
                                    >
                                        {renderAgentName(agent)}
                                    </Typography>
                                    <Typography
                                        variant='caption'
                                        color='text.secondary'
                                    >
                                        <TimeAgo date={agent.lastSeenAt} />
                                    </Typography>
                                </AgentHeader>
                                {agent.displayName ? (
                                    <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        component='div'
                                        sx={{ ml: 2.25, mb: 0.5 }}
                                    >
                                        {agent.externalId}
                                    </Typography>
                                ) : null}
                                {agent.recentEvents.length > 0 ? (
                                    <EventList>
                                        {agent.recentEvents.map((e) => {
                                            const reverted =
                                                revertedEventIds.has(e.id);
                                            const kind = eventKind(e.id);
                                            return (
                                                <Box
                                                    key={e.id}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems:
                                                            'flex-start',
                                                        gap: 1,
                                                        opacity: reverted
                                                            ? 0.55
                                                            : 1,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            textDecoration:
                                                                reverted
                                                                    ? 'line-through'
                                                                    : 'none',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                gap: 1,
                                                                mb: 0.25,
                                                            }}
                                                        >
                                                            <Chip
                                                                size='small'
                                                                label={
                                                                    kind ===
                                                                    'action'
                                                                        ? 'Action'
                                                                        : 'Info'
                                                                }
                                                                color={
                                                                    kind ===
                                                                    'action'
                                                                        ? 'primary'
                                                                        : 'default'
                                                                }
                                                                variant={
                                                                    kind ===
                                                                    'action'
                                                                        ? 'filled'
                                                                        : 'outlined'
                                                                }
                                                            />
                                                            <Typography
                                                                variant='caption'
                                                                color='text.secondary'
                                                                component='span'
                                                            >
                                                                <TimeAgo
                                                                    date={
                                                                        e.timestamp
                                                                    }
                                                                />
                                                            </Typography>
                                                        </Box>
                                                        {e.title ? (
                                                            <Typography
                                                                variant='subtitle2'
                                                                component='div'
                                                            >
                                                                {e.title}
                                                            </Typography>
                                                        ) : null}
                                                        <MarkdownBody>
                                                            <Markdown>
                                                                {e.description}
                                                            </Markdown>
                                                        </MarkdownBody>
                                                    </Box>
                                                    {kind === 'action' ? (
                                                        reverted ? (
                                                            <Chip
                                                                size='small'
                                                                label='Reverted'
                                                                variant='outlined'
                                                                sx={{
                                                                    mt: 0.5,
                                                                }}
                                                            />
                                                        ) : (
                                                            <Tooltip
                                                                title='Revert this action'
                                                                arrow
                                                            >
                                                                <IconButton
                                                                    size='small'
                                                                    aria-label='revert event'
                                                                    onClick={() =>
                                                                        handleRevertEvent(
                                                                            e.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <UndoIcon fontSize='small' />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )
                                                    ) : null}
                                                </Box>
                                            );
                                        })}
                                    </EventList>
                                ) : null}
                            </AgentEntry>
                        ))
                    )}
                </DialogContent>
            </Dialog>
        </Fragment>
    );
};
