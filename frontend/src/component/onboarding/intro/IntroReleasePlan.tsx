import { type ReactNode, useEffect, useState } from 'react';
import {
    alpha,
    Box,
    Button,
    Chip,
    Link,
    styled,
    Switch,
    Typography,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { StrategyEvaluationChip } from 'component/common/ConstraintsList/StrategyEvaluationChip/StrategyEvaluationChip';

export type ReleasePlanState =
    | 'ready'
    | 'running'
    | 'advanced'
    | 'paused'
    | 'protected'
    | 'triggered';

export const INTRO_RELEASE_PLAN_MILESTONE_MS = 6500;

export interface IIntroReleaseConstraint {
    field: string;
    values: string[];
}

export interface IIntroReleaseMilestone {
    name: string;
    rollout: number;
    constraints: IIntroReleaseConstraint[];
}

const StyledFlagHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledFlagName = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body1.fontSize,
}));

const StyledCard = styled(Box)(({ theme }) => ({
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    background: theme.palette.background.paper,
}));

const StyledEnvironmentHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.5),
    background: theme.palette.background.elevation1,
}));

const StyledEnvironmentName = styled('span')(({ theme }) => ({
    marginRight: 'auto',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
}));

const StyledBody = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.25),
    padding: theme.spacing(1.5),
}));

const StyledPlanHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.4),
}));

const StyledPlanTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
}));

const StyledMilestones = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

const StyledMilestone = styled(Box, {
    shouldForwardProp: (prop) =>
        !['active', 'completed', 'stopped'].includes(String(prop)),
})<{ active: boolean; completed: boolean; stopped: boolean }>(
    ({ theme, active, completed, stopped }) => ({
        overflow: 'hidden',
        border: `${active ? '1.5px' : '1px'} solid ${
            stopped
                ? theme.palette.warning.main
                : active
                  ? theme.palette.success.border
                  : completed
                    ? theme.palette.success.border
                    : theme.palette.divider
        }`,
        borderRadius: theme.shape.borderRadiusLarge,
        background: completed
            ? theme.palette.background.default
            : theme.palette.background.paper,
        transition: theme.transitions.create(
            ['background-color', 'border-color'],
            { duration: theme.transitions.duration.standard },
        ),
    }),
);

const StyledMilestoneSummary = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact: boolean }>(({ theme, compact }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: theme.spacing(1),
    minHeight: compact ? 42 : 62,
    padding: compact ? theme.spacing(0.6, 1) : theme.spacing(0.9, 1.25),
    cursor: compact ? 'default' : 'pointer',
}));

const StyledMilestoneCopy = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    minWidth: 0,
}));

const StyledMilestoneLabel = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
}));

const StyledMilestoneMeta = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
    minHeight: 20,
}));

const StyledMilestoneStatus = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.4),
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
}));

const StyledMilestoneTitle = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>(({ theme, completed }) => ({
    color: completed
        ? theme.palette.text.secondary
        : theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledStatusRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
    minHeight: 24,
}));

const StyledRunningChip = styled(Chip)(({ theme }) => ({
    height: 20,
    color: theme.palette.success.dark,
    background: alpha(theme.palette.success.main, 0.16),
    '& .MuiChip-icon': {
        color: theme.palette.success.main,
        fontSize: 15,
    },
    '& .MuiChip-label': {
        padding: theme.spacing(0, 0.75),
        fontSize: theme.typography.caption.fontSize,
    },
}));

const StyledStartButton = styled(Button)(({ theme }) => ({
    minWidth: 0,
    padding: theme.spacing(0.2, 0.5),
}));

const StyledViewStrategy = styled(Button)(({ theme }) => ({
    flexShrink: 0,
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightRegular,
}));

const StyledMilestoneDetails = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    opacity: open ? 1 : 0,
    borderTop: open ? `1px solid ${theme.palette.divider}` : 'none',
    transition: theme.transitions.create(['grid-template-rows', 'opacity'], {
        duration: theme.transitions.duration.standard,
    }),
    '& > div': {
        minHeight: 0,
        overflow: 'hidden',
    },
}));

const StyledStrategy = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(1.1, 1.25),
    background: 'transparent',
}));

const StyledStrategyTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallerBody,
}));

const StyledConstraintRow = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `${theme.spacing(8)} auto minmax(0, 1fr)`,
    alignItems: 'center',
    gap: theme.spacing(1),
    minHeight: theme.spacing(3.5),
}));

const StyledConstraintField = styled('span')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
}));

const StyledConstraintValues = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    minWidth: 0,
}));

const StyledConstraintValue = styled(Chip)(({ theme }) => ({
    height: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusLarge,
    border: '1px solid transparent',
    backgroundColor: theme.palette.background.elevation2,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    boxShadow: 'none',
    userSelect: 'none',
}));

const StyledAutomation = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    padding: theme.spacing(1, 1.25),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledAutomationSentence = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledAutomationIcon = styled(Box)(({ theme }) => ({
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    width: 20,
    height: 20,
    borderRadius: '50%',
    color: theme.palette.common.white,
    background: theme.palette.primary.main,
}));

const StyledProgress = styled(Box)(({ theme }) => ({
    height: 4,
    overflow: 'hidden',
    borderRadius: 999,
    background: theme.palette.background.elevation2,
}));

const StyledProgressFill = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'durationMs',
})<{ durationMs: number }>(({ theme, durationMs }) => ({
    width: 0,
    height: '100%',
    borderRadius: 'inherit',
    background: theme.palette.primary.main,
    '@keyframes releasePlanProgress': {
        from: { width: 0 },
        to: { width: '100%' },
    },
    animation: `releasePlanProgress ${durationMs}ms linear forwards`,
    '@media (prefers-reduced-motion: reduce)': {
        animationTimingFunction: 'steps(4, end)',
    },
}));

const StyledConnection = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed: boolean }>(({ theme, completed }) => ({
    width: 2,
    height: theme.spacing(1.5),
    marginLeft: theme.spacing(3.25),
    background: completed ? theme.palette.divider : theme.palette.primary.main,
}));

interface IIntroReleasePlanProps {
    environmentEnabled: boolean;
    milestones: IIntroReleaseMilestone[];
    activeMilestoneIndex: number;
    state: ReleasePlanState;
    detailed?: boolean;
    interactive?: boolean;
    milestoneDurationMs?: number;
    automationDelayMinutes?: number;
    autoExpandActive?: boolean;
    children?: ReactNode;
    environmentChildren?: ReactNode;
    onEnvironmentChange: (enabled: boolean) => void;
    onStartMilestone?: (index: number) => void;
}

export const IntroReleasePlan = ({
    environmentEnabled,
    milestones,
    activeMilestoneIndex,
    state,
    detailed = false,
    interactive = false,
    milestoneDurationMs = INTRO_RELEASE_PLAN_MILESTONE_MS,
    automationDelayMinutes = 30,
    autoExpandActive = true,
    children,
    environmentChildren,
    onEnvironmentChange,
    onStartMilestone,
}: IIntroReleasePlanProps) => {
    const [expanded, setExpanded] = useState<number[]>([]);
    const isStopped = state === 'paused' || state === 'triggered';

    useEffect(() => {
        if (!detailed || state === 'ready' || !autoExpandActive) {
            setExpanded([]);
            return;
        }
        setExpanded([activeMilestoneIndex]);
    }, [activeMilestoneIndex, autoExpandActive, detailed, state]);

    const toggleExpanded = (index: number) => {
        setExpanded((current) =>
            current.includes(index)
                ? current.filter((item) => item !== index)
                : [...current, index],
        );
    };

    return (
        <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            data-testid='QUICK_TOUR_INTRO_RELEASE_PLAN'
        >
            <StyledFlagHeader>
                <OutlinedFlagIcon fontSize='small' color='primary' />
                <StyledFlagName>my-feature</StyledFlagName>
            </StyledFlagHeader>

            {children ? <Box sx={{ mb: 1.5 }}>{children}</Box> : null}

            <StyledCard>
                <StyledEnvironmentHeader>
                    <CloudCircleIcon fontSize='small' color='disabled' />
                    <StyledEnvironmentName>
                        Production environment
                    </StyledEnvironmentName>
                    <Switch
                        checked={environmentEnabled}
                        onChange={(event) =>
                            onEnvironmentChange(event.target.checked)
                        }
                        size='small'
                        slotProps={{
                            input: {
                                'aria-label': 'Toggle my-feature in production',
                            },
                        }}
                        data-testid='QUICK_TOUR_INTRO_ONOFF_SWITCH'
                    />
                </StyledEnvironmentHeader>

                {environmentChildren}

                <StyledBody>
                    <StyledPlanHeader>
                        <StyledPlanTitle>
                            <strong>Release plan:</strong>
                            <span>Progressive audience release</span>
                            <HelpIcon
                                htmlTooltip
                                tooltip={
                                    <>
                                        <Typography
                                            variant='body2'
                                            component='p'
                                            sx={{ mb: 1 }}
                                        >
                                            Release plans save a sequence of
                                            strategies as milestones. Start any
                                            milestone manually, or add
                                            automation to advance between them.
                                        </Typography>
                                        <Link
                                            href='https://docs.getunleash.io/reference/release-templates'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            variant='body2'
                                        >
                                            Read more in the documentation
                                        </Link>
                                    </>
                                }
                            />
                        </StyledPlanTitle>
                        <Typography variant='caption' color='textSecondary'>
                            Reuse rollout and targeting rules, then advance them
                            automatically or whenever your team is ready.
                        </Typography>
                    </StyledPlanHeader>

                    <StyledMilestones>
                        {milestones.map((milestone, index) => {
                            const completed = index < activeMilestoneIndex;
                            const active =
                                index === activeMilestoneIndex &&
                                state !== 'ready';
                            const running =
                                active && environmentEnabled && !isStopped;
                            const open = detailed && expanded.includes(index);
                            const isLast = index === milestones.length - 1;

                            return (
                                <Box key={milestone.name}>
                                    <StyledMilestone
                                        active={active}
                                        completed={completed}
                                        stopped={active && isStopped}
                                        data-testid={`QUICK_TOUR_INTRO_MILESTONE_${index + 1}`}
                                    >
                                        <StyledMilestoneSummary
                                            compact={!detailed}
                                            onClick={
                                                detailed
                                                    ? () =>
                                                          toggleExpanded(index)
                                                    : undefined
                                            }
                                        >
                                            <StyledMilestoneCopy>
                                                {detailed ? (
                                                    <StyledMilestoneMeta>
                                                        <StyledMilestoneLabel>
                                                            Milestone
                                                        </StyledMilestoneLabel>
                                                        {completed ? (
                                                            <StyledMilestoneStatus>
                                                                <CheckCircleOutlineIcon
                                                                    color='success'
                                                                    sx={{
                                                                        fontSize: 15,
                                                                    }}
                                                                />
                                                                <span>
                                                                    Completed
                                                                </span>
                                                            </StyledMilestoneStatus>
                                                        ) : running ? (
                                                            <StyledRunningChip
                                                                icon={
                                                                    <PlayCircleIcon />
                                                                }
                                                                label='Running'
                                                                size='small'
                                                            />
                                                        ) : active &&
                                                          isStopped ? (
                                                            <StyledMilestoneStatus>
                                                                <PauseCircleIcon
                                                                    color='warning'
                                                                    sx={{
                                                                        fontSize: 15,
                                                                    }}
                                                                />
                                                                <span>
                                                                    {state ===
                                                                    'paused'
                                                                        ? 'Paused (disabled in environment)'
                                                                        : 'Stopped by safeguard'}
                                                                </span>
                                                            </StyledMilestoneStatus>
                                                        ) : null}
                                                    </StyledMilestoneMeta>
                                                ) : null}
                                                <StyledMilestoneTitle
                                                    variant='body2'
                                                    completed={completed}
                                                >
                                                    {milestone.name}
                                                </StyledMilestoneTitle>
                                                {detailed && interactive ? (
                                                    <StyledStatusRow>
                                                        <StyledStartButton
                                                            size='small'
                                                            disabled={running}
                                                            startIcon={
                                                                <PlayCircleIcon />
                                                            }
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                event.stopPropagation();
                                                                onStartMilestone?.(
                                                                    index,
                                                                );
                                                            }}
                                                        >
                                                            Start now
                                                        </StyledStartButton>
                                                    </StyledStatusRow>
                                                ) : null}
                                            </StyledMilestoneCopy>

                                            {detailed ? (
                                                <StyledViewStrategy
                                                    size='small'
                                                    endIcon={
                                                        <ExpandMoreIcon
                                                            sx={{
                                                                transform: open
                                                                    ? 'rotate(180deg)'
                                                                    : 'none',
                                                                transition:
                                                                    'transform 200ms ease',
                                                            }}
                                                        />
                                                    }
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleExpanded(index);
                                                    }}
                                                    aria-expanded={open}
                                                >
                                                    {open ? 'Hide' : 'View'}{' '}
                                                    strategy
                                                </StyledViewStrategy>
                                            ) : (
                                                <Typography
                                                    variant='caption'
                                                    color='textSecondary'
                                                >
                                                    {completed
                                                        ? 'Completed'
                                                        : running
                                                          ? 'Running'
                                                          : active && isStopped
                                                            ? state === 'paused'
                                                                ? 'Paused'
                                                                : 'Stopped by safeguard'
                                                            : 'Not started'}
                                                </Typography>
                                            )}
                                        </StyledMilestoneSummary>

                                        <StyledMilestoneDetails open={open}>
                                            <div>
                                                <StyledStrategy>
                                                    <StyledStrategyTitle>
                                                        <span>
                                                            Gradual rollout
                                                        </span>
                                                        <strong>
                                                            {milestone.rollout}%
                                                        </strong>
                                                    </StyledStrategyTitle>
                                                    {milestone.constraints.map(
                                                        (constraint) => (
                                                            <StyledConstraintRow
                                                                key={
                                                                    constraint.field
                                                                }
                                                            >
                                                                <StyledConstraintField>
                                                                    {
                                                                        constraint.field
                                                                    }
                                                                </StyledConstraintField>
                                                                <StrategyEvaluationChip label='is one of' />
                                                                <StyledConstraintValues>
                                                                    {constraint.values.map(
                                                                        (
                                                                            value,
                                                                        ) => (
                                                                            <StyledConstraintValue
                                                                                key={
                                                                                    value
                                                                                }
                                                                                label={
                                                                                    value
                                                                                }
                                                                            />
                                                                        ),
                                                                    )}
                                                                </StyledConstraintValues>
                                                            </StyledConstraintRow>
                                                        ),
                                                    )}
                                                </StyledStrategy>
                                            </div>
                                        </StyledMilestoneDetails>

                                        {running && !isLast ? (
                                            <StyledAutomation>
                                                <StyledAutomationSentence>
                                                    <StyledAutomationIcon>
                                                        <BoltIcon
                                                            sx={{
                                                                fontSize: 15,
                                                            }}
                                                        />
                                                    </StyledAutomationIcon>
                                                    <span>
                                                        Proceed after{' '}
                                                        {automationDelayMinutes}{' '}
                                                        minutes from milestone
                                                        start
                                                    </span>
                                                </StyledAutomationSentence>
                                                <StyledProgress>
                                                    <StyledProgressFill
                                                        key={index}
                                                        durationMs={
                                                            milestoneDurationMs
                                                        }
                                                        data-duration-ms={
                                                            milestoneDurationMs
                                                        }
                                                        data-testid='QUICK_TOUR_INTRO_MILESTONE_PROGRESS'
                                                    />
                                                </StyledProgress>
                                            </StyledAutomation>
                                        ) : null}
                                    </StyledMilestone>

                                    {index < milestones.length - 1 ? (
                                        <StyledConnection
                                            completed={completed}
                                        />
                                    ) : null}
                                </Box>
                            );
                        })}
                    </StyledMilestones>
                </StyledBody>
            </StyledCard>
        </Box>
    );
};
