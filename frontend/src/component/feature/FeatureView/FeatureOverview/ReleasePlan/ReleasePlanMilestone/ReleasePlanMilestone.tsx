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
} from './ReleasePlanMilestoneStatus';
import { useState } from 'react';
import {
    StyledContentList,
    StyledListItem,
} from '../../FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/EnvironmentAccordionBody';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import { StrategyItem } from '../../FeatureOverviewEnvironments/FeatureOverviewEnvironment/EnvironmentAccordionBody/StrategyDraggableItem/StrategyItem/StrategyItem';

const StyledAccordion = styled(Accordion, {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: MilestoneStatus }>(({ theme, status }) => ({
    border: `1px solid ${status === 'active' ? theme.palette.success.border : theme.palette.divider}`,
    boxShadow: 'none',
    margin: 0,
    backgroundColor: theme.palette.background.paper,
    '&:before': {
        display: 'none',
    },
}));

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
    borderBottomLeftRadius: theme.shape.borderRadiusLarge,
    borderBottomRightRadius: theme.shape.borderRadiusLarge,
    padding: 0,
}));

interface IReleasePlanMilestoneProps {
    milestone: IReleasePlanMilestone;
    status?: MilestoneStatus;
    onStartMilestone?: (milestone: IReleasePlanMilestone) => void;
    readonly?: boolean;
}

export const ReleasePlanMilestone = ({
    milestone,
    status = 'not-started',
    onStartMilestone,
    readonly,
}: IReleasePlanMilestoneProps) => {
    const [expanded, setExpanded] = useState(false);

    if (!milestone.strategies.length) {
        return (
            <StyledAccordion status={status}>
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
                    <StyledSecondaryLabel>No strategies</StyledSecondaryLabel>
                </StyledAccordionSummary>
            </StyledAccordion>
        );
    }

    return (
        <StyledAccordion
            status={status}
            onChange={(evt, expanded) => setExpanded(expanded)}
        >
            <StyledAccordionSummary expandIcon={<ExpandMore />}>
                <StyledTitleContainer>
                    <StyledTitle>{milestone.name}</StyledTitle>
                    {!readonly && onStartMilestone && (
                        <ReleasePlanMilestoneStatus
                            status={status}
                            onStartMilestone={() => onStartMilestone(milestone)}
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
                <StyledContentList>
                    {milestone.strategies.map((strategy, index) => (
                        <StyledListItem key={strategy.id}>
                            {index > 0 ? <StrategySeparator /> : null}

                            <StrategyItem
                                strategy={{
                                    ...strategy,
                                    name:
                                        strategy.name ||
                                        strategy.strategyName ||
                                        '',
                                }}
                            />
                        </StyledListItem>
                    ))}
                </StyledContentList>
            </StyledAccordionDetails>
        </StyledAccordion>
    );
};
