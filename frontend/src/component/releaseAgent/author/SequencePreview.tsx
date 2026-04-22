import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Divider,
    IconButton,
    Paper,
    Stack,
    Typography,
    styled,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreOutlined';
import ShieldIcon from '@mui/icons-material/GppGoodOutlined';
import RocketIcon from '@mui/icons-material/RocketLaunchOutlined';
import PowerIcon from '@mui/icons-material/PowerSettingsNewOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import type {
    CompiledPreview,
    PreviewAction,
    PreviewSafeguard,
} from 'hooks/api/actions/useReleaseAgentApi/useReleaseAgentApi';

type Props = {
    preview: CompiledPreview;
    onCommit?: () => void;
    committable?: boolean;
    committing?: boolean;
};

const formatTime = (iso: string): string => {
    try {
        return new Date(iso).toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
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
        if (diff < 60) return `in ${diff}s`;
        if (diff < 3600) return `in ${Math.round(diff / 60)}m`;
        return `in ${Math.round(diff / 3600)}h`;
    } catch {
        return '';
    }
};

const Card = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(1.5),
}));

const TimelineRow = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(1.25, 0),
    '&:not(:last-of-type)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

const IconCircle = styled(Box)(({ theme }) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.secondary,
}));

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

const describeAction = (action: PreviewAction): string => {
    switch (action.actionType) {
        case 'strategy.create': {
            const payload = action.payload as {
                strategyName?: string;
                parameters?: Record<string, unknown>;
                title?: string;
            };
            if (payload.strategyName === 'flexibleRollout') {
                const rollout = payload.parameters?.rollout as
                    | string
                    | undefined;
                return rollout
                    ? `Create gradual rollout at ${rollout}% for ${action.featureName}`
                    : `Create gradual rollout strategy for ${action.featureName}`;
            }
            return `Create ${payload.strategyName ?? 'strategy'} for ${action.featureName}${payload.title ? ` · "${payload.title}"` : ''}`;
        }
        case 'strategy.update': {
            const payload = action.payload as {
                patch?: { parameters?: Record<string, unknown> };
            };
            const rollout = payload.patch?.parameters?.rollout as
                | string
                | undefined;
            if (rollout) {
                return `Ramp ${action.featureName} to ${rollout}%`;
            }
            return `Update strategy for ${action.featureName}`;
        }
        case 'strategy.delete':
            return `Remove strategy from ${action.featureName}`;
        case 'feature_environment.setEnabled': {
            const payload = action.payload as { enabled?: boolean };
            return payload.enabled
                ? `Enable ${action.featureName} in environment`
                : `Disable ${action.featureName} in environment`;
        }
        default:
            return `${(action as PreviewAction).actionType} on ${action.featureName}`;
    }
};

const ActionIcon = ({ action }: { action: PreviewAction }) => {
    switch (action.actionType) {
        case 'strategy.create':
            return <RocketIcon fontSize='small' />;
        case 'strategy.update':
            return <TuneIcon fontSize='small' />;
        case 'strategy.delete':
            return <DeleteIcon fontSize='small' />;
        case 'feature_environment.setEnabled':
            return <PowerIcon fontSize='small' />;
        default:
            return <TuneIcon fontSize='small' />;
    }
};

const describeSafeguard = (safeguard: PreviewSafeguard): string => {
    const { impactMetric, triggerCondition, featureName } = safeguard;
    const agg = impactMetric.aggregationMode;
    const op = triggerCondition.operator === '>' ? 'goes above' : 'falls below';
    return `Disable ${featureName} if ${impactMetric.metricName} (${agg} over ${impactMetric.timeRange}) ${op} ${triggerCondition.threshold}`;
};

type ExpandableRowProps = {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    payload: unknown;
};

const ExpandableRow = ({
    title,
    subtitle,
    icon,
    payload,
}: ExpandableRowProps) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <TimelineRow>
            <IconCircle>{icon}</IconCircle>
            <Stack sx={{ flex: 1, minWidth: 0 }} spacing={0.25}>
                <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                    spacing={1}
                >
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {title}
                    </Typography>
                    <ExpandButton
                        expanded={expanded}
                        onClick={() => setExpanded((v) => !v)}
                        size='small'
                        aria-label={expanded ? 'Hide details' : 'Show details'}
                    >
                        <ExpandMoreIcon fontSize='small' />
                    </ExpandButton>
                </Stack>
                {subtitle ? (
                    <Typography variant='caption' color='text.secondary'>
                        {subtitle}
                    </Typography>
                ) : null}
                <Collapse in={expanded} unmountOnExit>
                    <CodeBlock component='pre'>
                        {JSON.stringify(payload, null, 2)}
                    </CodeBlock>
                </Collapse>
            </Stack>
        </TimelineRow>
    );
};

export const SequencePreview = ({
    preview,
    onCommit,
    committable,
    committing,
}: Props) => {
    const now = new Date();
    const hasClarification = Boolean(preview.clarification);
    const actionCount = preview.actions.length;
    const safeguardCount = preview.safeguards.length;

    return (
        <Card variant='outlined'>
            <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                sx={{ mb: 1 }}
            >
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                    Proposed plan
                </Typography>
                <Chip size='small' label={preview.model} variant='outlined' />
                {actionCount > 0 ? (
                    <Chip
                        size='small'
                        label={`${actionCount} ${actionCount === 1 ? 'action' : 'actions'}`}
                    />
                ) : null}
                {safeguardCount > 0 ? (
                    <Chip
                        size='small'
                        icon={<ShieldIcon fontSize='small' />}
                        label={`${safeguardCount} safeguard${safeguardCount === 1 ? '' : 's'}`}
                        color='success'
                        variant='outlined'
                    />
                ) : null}
            </Stack>

            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {preview.rationale}
            </Typography>

            {hasClarification ? (
                <Alert severity='info' sx={{ mb: 2 }}>
                    {preview.clarification}
                </Alert>
            ) : null}

            {actionCount > 0 ? (
                <>
                    <Typography
                        variant='overline'
                        color='text.secondary'
                        sx={{ letterSpacing: 1 }}
                    >
                        Timeline
                    </Typography>
                    <Box>
                        {preview.actions.map((action, index) => {
                            const time = formatTime(action.fireAt);
                            const rel = formatRelative(action.fireAt, now);
                            return (
                                <ExpandableRow
                                    key={`action-${index}`}
                                    icon={<ActionIcon action={action} />}
                                    title={describeAction(action)}
                                    subtitle={`${time} · ${rel}`}
                                    payload={action.payload}
                                />
                            );
                        })}
                    </Box>
                </>
            ) : null}

            {safeguardCount > 0 ? (
                <>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                        variant='overline'
                        color='text.secondary'
                        sx={{ letterSpacing: 1 }}
                    >
                        Safeguards
                    </Typography>
                    <Box>
                        {preview.safeguards.map((safeguard, index) => (
                            <ExpandableRow
                                key={`safeguard-${index}`}
                                icon={<ShieldIcon fontSize='small' />}
                                title={describeSafeguard(safeguard)}
                                subtitle={`Metric source: ${safeguard.impactMetric.source ?? 'internal'}`}
                                payload={safeguard}
                            />
                        ))}
                    </Box>
                </>
            ) : null}

            {onCommit && !hasClarification && actionCount > 0 ? (
                <Stack
                    direction='row'
                    spacing={1}
                    sx={{ mt: 2.5 }}
                    justifyContent='flex-end'
                >
                    <Button
                        variant='contained'
                        size='small'
                        onClick={onCommit}
                        disabled={!committable || committing}
                        startIcon={
                            committing ? (
                                <CircularProgress size={14} />
                            ) : undefined
                        }
                    >
                        {committing ? 'Committing…' : 'Commit this plan'}
                    </Button>
                </Stack>
            ) : null}
        </Card>
    );
};
