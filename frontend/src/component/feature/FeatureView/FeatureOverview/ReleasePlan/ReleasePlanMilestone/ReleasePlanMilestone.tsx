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

import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { StrategyItem } from '../../FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyItem.tsx';
import { StrategyList } from 'component/common/StrategyList/StrategyList';
import { StrategyListItem } from 'component/common/StrategyList/StrategyListItem';
import { MilestoneAutomationSection } from './MilestoneAutomationSection.tsx';

const StyledAccordion = styled(Accordion, {
    shouldForwardProp: (prop) => prop !== 'status' && prop !== 'hasAutomation',
})<{ status: MilestoneStatus; hasAutomation?: boolean }>(
    ({ theme, status, hasAutomation }) => ({
        border: `1px solid ${status === 'active' ? theme.palette.success.border : theme.palette.divider}`,
        borderBottom: hasAutomation
            ? 'none'
            : `1px solid ${status === 'active' ? theme.palette.success.border : theme.palette.divider}`,
        overflow: 'hidden',
        boxShadow: 'none',
        margin: 0,
        backgroundColor: theme.palette.background.paper,
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

const StyledTitle = styled('span')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
}));

const StyledSecondaryLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
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
    showAutomation?: boolean;
    onAddAutomation?: () => void;
    automationForm?: React.ReactNode;
}

export const ReleasePlanMilestone = ({
    milestone,
    status = 'not-started',
    onStartMilestone,
    readonly,
    showAutomation,
    onAddAutomation,
    automationForm,
}: IReleasePlanMilestoneProps) => {
    const [expanded, setExpanded] = useState(false);

    if (!milestone.strategies.length) {
        return (
            <StyledMilestoneContainer>
                <StyledAccordion status={status} hasAutomation={showAutomation}>
                    <StyledAccordionSummary>
                        <StyledTitleContainer>
                            <StyledTitle>{milestone.name}</StyledTitle>
                            {!readonly && onStartMilestone && (
                                <ReleasePlanMilestoneStatus
                                    status={status}
                                    onStartMilestone={() =>
                                        onStartMilestone(milestone)
                                    }
                                />
                            )}
                        </StyledTitleContainer>
                        <StyledSecondaryLabel>
                            No strategies
                        </StyledSecondaryLabel>
                    </StyledAccordionSummary>
                </StyledAccordion>
                <MilestoneAutomationSection
                    showAutomation={showAutomation}
                    status={status}
                    onAddAutomation={onAddAutomation}
                    automationForm={automationForm}
                    transitionCondition={milestone.transitionCondition}
                />
            </StyledMilestoneContainer>
        );
    }

    return (
        <StyledMilestoneContainer>
            <StyledAccordion
                status={status}
                hasAutomation={showAutomation}
                onChange={(evt, expanded) => setExpanded(expanded)}
            >
                <StyledAccordionSummary expandIcon={<ExpandMore />}>
                    <StyledTitleContainer>
                        <StyledTitle>{milestone.name}</StyledTitle>
                        {!readonly && onStartMilestone && (
                            <ReleasePlanMilestoneStatus
                                status={status}
                                onStartMilestone={() =>
                                    onStartMilestone(milestone)
                                }
                            />
                        )}
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
            <MilestoneAutomationSection
                showAutomation={showAutomation}
                status={status}
                onAddAutomation={onAddAutomation}
                automationForm={automationForm}
                transitionCondition={milestone.transitionCondition}
            />
        </StyledMilestoneContainer>
    );
};
