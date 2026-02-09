import ExpandMore from '@mui/icons-material/ExpandMore';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    IconButton,
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
import { useNavigate } from 'react-router-dom';
import { formatCreateStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyCreate/FeatureStrategyCreate.tsx';
import { formatEditStrategyPath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit.tsx';
import { useUiFlag } from 'hooks/useUiFlag';

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

const StyledAddStrategyButton = styled('button')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.75, 1),
    margin: theme.spacing(1, 2, 2, 2),
    border: 'none',
    borderRadius: theme.shape.borderRadiusMedium,
    background: 'transparent',
    color: theme.palette.primary.main,
    cursor: 'pointer',
    fontSize: theme.typography.body2.fontSize,
    transition: 'all 0.2s ease',
    '&:hover': {
        background: theme.palette.action.hover,
    },
}));

const StyledEditButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    '&:hover': {
        color: theme.palette.primary.main,
    },
}));

interface IReleasePlanMilestoneProps {
    milestone: IReleasePlanMilestone;
    status?: MilestoneStatus;
    onStartMilestone?: (milestone: IReleasePlanMilestone) => void;
    readonly?: boolean;
    automationSection?: React.ReactNode;
    previousMilestoneStatus?: MilestoneStatus;
    projectId?: string;
    environmentId?: string;
    featureName?: string;
    releasePlanId?: string;
}

export const ReleasePlanMilestone = ({
    milestone,
    status = { type: 'not-started', progression: 'active' },
    onStartMilestone,
    readonly,
    automationSection,
    previousMilestoneStatus,
    projectId,
    environmentId,
    featureName,
    releasePlanId,
}: IReleasePlanMilestoneProps) => {
    const [expanded, setExpanded] = useState(true);
    const navigate = useNavigate();
    const inlineMilestonesEnabled = useUiFlag('inlineReleasePlanMilestones');
    const hasAutomation = Boolean(automationSection);
    const isPreviousMilestonePaused =
        previousMilestoneStatus?.type === 'paused' ||
        previousMilestoneStatus?.progression === 'paused';

    const canAddStrategy =
        inlineMilestonesEnabled &&
        !readonly &&
        projectId &&
        featureName &&
        environmentId &&
        releasePlanId;

    const onAddStrategy = () => {
        if (projectId && featureName && environmentId && releasePlanId) {
            navigate(
                formatCreateStrategyPath(
                    projectId,
                    featureName,
                    environmentId,
                    'flexibleRollout',
                    false,
                    milestone.id,
                    releasePlanId,
                ),
            );
        }
    };

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
                                            projectId={projectId}
                                            environmentId={environmentId}
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
                    {canAddStrategy && (
                        <StyledAddStrategyButton onClick={onAddStrategy}>
                            <Add fontSize='small' />
                            Add strategy
                        </StyledAddStrategyButton>
                    )}
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
                expanded={expanded}
                onChange={(_evt, expanded) => setExpanded(expanded)}
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
                                        projectId={projectId}
                                        environmentId={environmentId}
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
                                    headerItemsRight={
                                        canAddStrategy ? (
                                            <StyledEditButton
                                                size='small'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(
                                                        formatEditStrategyPath(
                                                            projectId!,
                                                            featureName!,
                                                            environmentId!,
                                                            strategy.id,
                                                            milestone.id,
                                                            releasePlanId!,
                                                        ),
                                                    );
                                                }}
                                                title='Edit strategy'
                                            >
                                                <Edit fontSize='small' />
                                            </StyledEditButton>
                                        ) : undefined
                                    }
                                />
                            </StrategyListItem>
                        ))}
                    </StrategyList>
                    {canAddStrategy && (
                        <StyledAddStrategyButton onClick={onAddStrategy}>
                            <Add fontSize='small' />
                            Add strategy
                        </StyledAddStrategyButton>
                    )}
                </StyledAccordionDetails>
            </StyledAccordion>
            {automationSection}
        </StyledMilestoneContainer>
    );
};
