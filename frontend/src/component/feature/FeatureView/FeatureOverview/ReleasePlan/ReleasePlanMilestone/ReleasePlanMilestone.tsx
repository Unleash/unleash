import ExpandMore from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
} from '@mui/material';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import {
    ReleasePlanMilestoneStatus,
    type MilestoneStatus,
} from './ReleasePlanMilestoneStatus.tsx';
import { useState } from 'react';
import { MilestoneNextStartTime } from './MilestoneNextStartTime.tsx';

import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { StrategyItem } from '../../FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyItem.tsx';
import { StrategyList } from 'component/common/StrategyList/StrategyList';
import { StrategyListItem } from 'component/common/StrategyList/StrategyListItem';
import { formatDateYMDHMS } from 'utils/formatDate';

const StyledAccordion = styled(Accordion, {
    shouldForwardProp: (prop) => prop !== 'status' && prop !== 'hasAutomation',
})<{ status: MilestoneStatus; hasAutomation?: boolean }>(
    ({ theme, status, hasAutomation }) => ({
        border: `${status.type === 'active' ? '1.5px' : '1px'} solid ${status.type === 'active' ? theme.palette.success.border : theme.palette.divider}`,
        borderBottom: hasAutomation
            ? 'none'
            : `${status.type === 'active' ? '1.5px' : '1px'} solid ${status.type === 'active' ? theme.palette.success.border : theme.palette.divider}`,
        overflow: 'hidden',
        boxShadow: 'none',
        margin: 0,
        backgroundColor:
            status.type === 'completed'
                ? theme.palette.background.default
                : theme.palette.background.paper,
        borderRadius: hasAutomation
            ? `${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px 0 0 !important`
            : `${theme.shape.borderRadiusLarge}px`,
        '&:before': {
            display: 'none',
        },
    }),
);

const StyledAccordionSummary = styled(AccordionSummary)({
    '& .MuiAccordionSummary-content': {
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '30px',
    },
});

const StyledTitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'start',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StyledMilestoneLabel = styled('span')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
}));

const StyledTitle = styled('span', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: MilestoneStatus }>(({ theme, status }) => ({
    fontWeight: theme.fontWeight.bold,
    color:
        status?.type === 'completed'
            ? theme.palette.text.secondary
            : theme.palette.text.primary,
}));

const StyledSecondaryLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledStartedAt = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightRegular,
}));

const StyledStatusRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
    padding: 0,
}));

const StyledMilestoneContainer = styled('div')({
    position: 'relative',
});

interface IReleasePlanMilestoneProps {
    milestone: IReleasePlanMilestone;
    status?: MilestoneStatus;
    onStartMilestone?: (milestone: IReleasePlanMilestone) => void;
    readonly?: boolean;
    automationSection?: React.ReactNode;
    previousMilestoneStatus?: MilestoneStatus;
}

export const ReleasePlanMilestone = ({
    milestone,
    status = { type: 'not-started', progressions: 'active' },
    onStartMilestone,
    readonly,
    automationSection,
    previousMilestoneStatus,
}: IReleasePlanMilestoneProps) => {
    const [expanded, setExpanded] = useState(false);
    const hasAutomation = Boolean(automationSection);
    const isPreviousMilestonePaused =
        previousMilestoneStatus?.type === 'paused';

    if (!milestone.strategies.length) {
        return (
            <StyledMilestoneContainer>
                <StyledAccordion status={status} hasAutomation={hasAutomation}>
                    <StyledAccordionSummary>
                        <StyledTitleContainer>
                            <StyledMilestoneLabel>
                                Milestone
                            </StyledMilestoneLabel>
                            <StyledTitle status={status}>
                                {milestone.name}
                            </StyledTitle>
                            {(!readonly && onStartMilestone) ||
                            (status.type === 'active' &&
                                milestone.startedAt) ? (
                                <StyledStatusRow>
                                    {!readonly &&
                                        !isPreviousMilestonePaused && (
                                            <MilestoneNextStartTime
                                                status={status}
                                            />
                                        )}
                                    {!readonly && onStartMilestone && (
                                        <ReleasePlanMilestoneStatus
                                            status={status}
                                            onStartMilestone={() =>
                                                onStartMilestone(milestone)
                                            }
                                        />
                                    )}
                                    {status.type === 'active' &&
                                        milestone.startedAt && (
                                            <StyledStartedAt>
                                                Started{' '}
                                                {formatDateYMDHMS(
                                                    milestone.startedAt,
                                                )}
                                            </StyledStartedAt>
                                        )}
                                </StyledStatusRow>
                            ) : null}
                        </StyledTitleContainer>
                        <StyledSecondaryLabel>
                            No strategies
                        </StyledSecondaryLabel>
                    </StyledAccordionSummary>
                </StyledAccordion>
                {automationSection}
            </StyledMilestoneContainer>
        );
    }

    return (
        <StyledMilestoneContainer>
            <StyledAccordion
                status={status}
                hasAutomation={hasAutomation}
                onChange={(evt, expanded) => setExpanded(expanded)}
            >
                <StyledAccordionSummary expandIcon={<ExpandMore />}>
                    <StyledTitleContainer>
                        <StyledMilestoneLabel>Milestone</StyledMilestoneLabel>
                        <StyledTitle status={status}>
                            {milestone.name}
                        </StyledTitle>
                        {(!readonly && onStartMilestone) ||
                        (status.type === 'active' && milestone.startedAt) ? (
                            <StyledStatusRow>
                                {!readonly && !isPreviousMilestonePaused && (
                                    <MilestoneNextStartTime status={status} />
                                )}
                                {!readonly && onStartMilestone && (
                                    <ReleasePlanMilestoneStatus
                                        status={status}
                                        onStartMilestone={() =>
                                            onStartMilestone(milestone)
                                        }
                                    />
                                )}
                                {status.type === 'active' &&
                                    milestone.startedAt && (
                                        <StyledStartedAt>
                                            Started{' '}
                                            {formatDateYMDHMS(
                                                milestone.startedAt,
                                            )}
                                        </StyledStartedAt>
                                    )}
                            </StyledStatusRow>
                        ) : null}
                    </StyledTitleContainer>
                    <StyledSecondaryLabel>
                        {milestone.strategies.length === 1
                            ? `${expanded ? 'Hide' : 'View'} strategy`
                            : `${expanded ? 'Hide' : 'View'} ${milestone.strategies.length} strategies`}
                    </StyledSecondaryLabel>
                </StyledAccordionSummary>
                <StyledAccordionDetails>
                    <StrategyList>
                        {milestone.strategies.map((strategy, index) => (
                            <StrategyListItem key={strategy.id}>
                                {index > 0 ? <StrategySeparator /> : null}

                                <StrategyItem
                                    strategyHeaderLevel={4}
                                    strategy={{
                                        ...strategy,
                                        name:
                                            strategy.name ||
                                            strategy.strategyName ||
                                            '',
                                    }}
                                />
                            </StrategyListItem>
                        ))}
                    </StrategyList>
                </StyledAccordionDetails>
            </StyledAccordion>
            {automationSection}
        </StyledMilestoneContainer>
    );
};
