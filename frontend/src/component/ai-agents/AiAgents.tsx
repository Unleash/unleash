import { Fragment, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    styled,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import UndoIcon from '@mui/icons-material/Undo';
import useToast from 'hooks/useToast';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { Markdown } from 'component/common/Markdown/Markdown';
import {
    type AiAgent,
    useAiAgents,
} from 'hooks/api/getters/useAiAgents/useAiAgents';

const StatusBubble = styled('span', {
    shouldForwardProp: (prop) => prop !== 'live',
})<{ live: boolean }>(({ theme, live }) => ({
    display: 'inline-block',
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: live
        ? theme.palette.success.main
        : theme.palette.neutral.border,
    boxShadow: live ? `0 0 0 4px ${theme.palette.success.main}22` : 'none',
}));

const AgentNameCell = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.primary,
}));

const EventsContainer = styled(Box)(({ theme }) => ({
    margin: theme.spacing(1, 0, 2, 6),
    paddingLeft: theme.spacing(2),
    borderLeft: `2px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
}));

const EventTimestamp = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.25),
}));

const EmptyEvents = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
}));

const MarkdownBody = styled('div')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.primary,
    overflowWrap: 'anywhere',
    '& p': { margin: theme.spacing(0.25, 0) },
    '& ul, & ol': { margin: theme.spacing(0.25, 0), paddingLeft: theme.spacing(2.5) },
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

// Demo-only: deterministic 50/50 split — same event always lands on the
// same side across renders. Action events can be reverted; Info cannot.
const eventKind = (eventId: number): 'action' | 'info' =>
    eventId % 2 === 0 ? 'action' : 'info';

const stripMarkdown = (text: string): string =>
    text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_~]+/g, '')
        .replace(/^#+\s*/gm, '')
        .replace(/^>\s*/gm, '')
        .replace(/\s+/g, ' ')
        .trim();

const EmptyState = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

type AgentRowProps = {
    agent: AiAgent;
    isStopped: boolean;
    onStop: () => void;
    revertedEventIds: Set<number>;
    onRevertEvent: (eventId: number) => void;
};

const AgentRow = ({
    agent,
    isStopped,
    onStop,
    revertedEventIds,
    onRevertEvent,
}: AgentRowProps) => {
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <Fragment>
            <TableRow
                hover
                sx={{
                    '& > *': { borderBottom: 'unset' },
                    opacity: isStopped ? 0.55 : 1,
                }}
            >
                <TableCell sx={{ width: 56 }}>
                    <IconButton
                        aria-label='expand agent events'
                        size='small'
                        onClick={() => setOpen((prev) => !prev)}
                    >
                        {open ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ width: 80 }}>
                    <Tooltip
                        title={
                            agent.isLive
                                ? 'Live (heartbeat in last 30 min)'
                                : 'Idle'
                        }
                        arrow
                    >
                        <StatusBubble live={agent.isLive} />
                    </Tooltip>
                </TableCell>
                <TableCell>
                    <AgentNameCell>
                        {agent.displayName || agent.externalId}
                    </AgentNameCell>
                    {(() => {
                        const lastEvent = agent.recentEvents[0];
                        const lastMessage = lastEvent
                            ? lastEvent.title ||
                              stripMarkdown(lastEvent.description)
                            : null;
                        const meta = [agent.type, agent.displayName ? agent.externalId : null]
                            .filter(Boolean)
                            .join(' · ');
                        return (
                            <>
                                {lastMessage ? (
                                    <Typography
                                        variant='body2'
                                        color='text.secondary'
                                        component='div'
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: 600,
                                        }}
                                        title={lastMessage}
                                    >
                                        {lastMessage}
                                    </Typography>
                                ) : null}
                                {meta ? (
                                    <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        component='div'
                                    >
                                        {meta}
                                    </Typography>
                                ) : null}
                            </>
                        );
                    })()}
                </TableCell>
                <TableCell sx={{ width: 200, whiteSpace: 'nowrap' }}>
                    <TimeAgo date={agent.lastSeenAt} />
                </TableCell>
                <TableCell sx={{ width: 120, whiteSpace: 'nowrap' }} align='right'>
                    {isStopped ? (
                        <Chip
                            size='small'
                            color='default'
                            label='Stopped'
                            variant='outlined'
                        />
                    ) : agent.isLive ? (
                        <Tooltip title='Stop this agent' arrow>
                            <Button
                                size='small'
                                color='error'
                                variant='outlined'
                                startIcon={<StopCircleIcon />}
                                onClick={() => setConfirmOpen(true)}
                            >
                                Stop
                            </Button>
                        </Tooltip>
                    ) : null}
                </TableCell>
            </TableRow>
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                maxWidth='xs'
                fullWidth
            >
                <DialogTitle>
                    Stop {agent.displayName || agent.externalId}?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will halt all of this agent's autonomous activity
                        immediately. The agent will stop reporting heartbeats
                        and events. You can re-enable it later from its
                        operator console.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        color='error'
                        variant='contained'
                        onClick={() => {
                            setConfirmOpen(false);
                            onStop();
                        }}
                    >
                        Stop agent
                    </Button>
                </DialogActions>
            </Dialog>
            <TableRow>
                <TableCell sx={{ p: 0 }} colSpan={5}>
                    <Collapse in={open} timeout='auto' unmountOnExit>
                        <EventsContainer>
                            {agent.recentEvents.length === 0 ? (
                                <EmptyEvents>No events yet</EmptyEvents>
                            ) : (
                                agent.recentEvents.map((event) => {
                                    const reverted = revertedEventIds.has(
                                        event.id,
                                    );
                                    const kind = eventKind(event.id);
                                    return (
                                        <Box
                                            key={event.id}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 1,
                                                opacity: reverted ? 0.55 : 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    textDecoration: reverted
                                                        ? 'line-through'
                                                        : 'none',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        mb: 0.25,
                                                    }}
                                                >
                                                    <Chip
                                                        size='small'
                                                        label={
                                                            kind === 'action'
                                                                ? 'Action'
                                                                : 'Info'
                                                        }
                                                        color={
                                                            kind === 'action'
                                                                ? 'primary'
                                                                : 'default'
                                                        }
                                                        variant={
                                                            kind === 'action'
                                                                ? 'filled'
                                                                : 'outlined'
                                                        }
                                                    />
                                                    <EventTimestamp
                                                        sx={{ mb: 0 }}
                                                    >
                                                        <TimeAgo
                                                            date={
                                                                event.timestamp
                                                            }
                                                        />
                                                    </EventTimestamp>
                                                </Box>
                                                {event.title ? (
                                                    <Typography
                                                        variant='subtitle2'
                                                        component='div'
                                                    >
                                                        {event.title}
                                                    </Typography>
                                                ) : null}
                                                <MarkdownBody>
                                                    <Markdown>
                                                        {event.description}
                                                    </Markdown>
                                                </MarkdownBody>
                                            </Box>
                                            {kind === 'action' ? (
                                                reverted ? (
                                                    <Chip
                                                        size='small'
                                                        label='Reverted'
                                                        variant='outlined'
                                                        sx={{ mt: 1 }}
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
                                                                onRevertEvent(
                                                                    event.id,
                                                                )
                                                            }
                                                            sx={{ mt: 0.5 }}
                                                        >
                                                            <UndoIcon fontSize='small' />
                                                        </IconButton>
                                                    </Tooltip>
                                                )
                                            ) : null}
                                        </Box>
                                    );
                                })
                            )}
                        </EventsContainer>
                    </Collapse>
                </TableCell>
            </TableRow>
        </Fragment>
    );
};

export const AiAgents = () => {
    const { agents, loading, error } = useAiAgents();
    const { setToastData } = useToast();
    const [stoppedAgentIds, setStoppedAgentIds] = useState<Set<number>>(
        new Set(),
    );
    const [revertedEventIds, setRevertedEventIds] = useState<Set<number>>(
        new Set(),
    );

    const handleStop = (agent: AiAgent) => {
        setStoppedAgentIds((prev) => {
            const next = new Set(prev);
            next.add(agent.id);
            return next;
        });
        setToastData({
            text: `Stopped ${agent.displayName || agent.externalId} (demo only — the agent will keep reporting)`,
            type: 'success',
        });
    };

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

    return (
        <PageContent
            header={<PageHeader title='AI agents' />}
            isLoading={loading}
        >
            {error ? (
                <EmptyState>Failed to load AI agents: {error.message}</EmptyState>
            ) : agents.length === 0 && !loading ? (
                <EmptyState>
                    No AI agents have reported yet. Send a heartbeat or update
                    to <code>POST /api/admin/ai-agents/&lt;externalId&gt;</code>
                    {' '}to register one.
                </EmptyState>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>Status</TableCell>
                            <TableCell>Agent</TableCell>
                            <TableCell>Last reported</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {agents.map((agent) => (
                            <AgentRow
                                key={agent.id}
                                agent={agent}
                                isStopped={stoppedAgentIds.has(agent.id)}
                                onStop={() => handleStop(agent)}
                                revertedEventIds={revertedEventIds}
                                onRevertEvent={handleRevertEvent}
                            />
                        ))}
                    </TableBody>
                </Table>
            )}
        </PageContent>
    );
};
