import ExpandMore from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
} from '@mui/material';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ReleasePlanMilestoneStrategy } from './ReleasePlanMilestoneStrategy';
import { StrategySeparator } from 'component/common/StrategySeparator/StrategySeparator';
import {
    ReleasePlanMilestoneStatus,
    type MilestoneStatus,
} from './ReleasePlanMilestoneStatus';

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
    backgroundColor: theme.palette.envAccordion.expanded,
    borderBottomLeftRadius: theme.shape.borderRadiusLarge,
    borderBottomRightRadius: theme.shape.borderRadiusLarge,
}));

interface IReleasePlanMilestoneProps {
    milestone: IReleasePlanMilestone;
    status: MilestoneStatus;
    onStartMilestone: (milestone: IReleasePlanMilestone) => void;
}

export const ReleasePlanMilestone = ({
    milestone,
    status,
    onStartMilestone,
}: IReleasePlanMilestoneProps) => {
    if (!milestone.strategies.length) {
        return (
            <StyledAccordion status={status}>
                <StyledAccordionSummary>
                    <StyledTitleContainer>
                        <StyledTitle>{milestone.name}</StyledTitle>
                        <ReleasePlanMilestoneStatus
                            status={status}
                            onStartMilestone={() => onStartMilestone(milestone)}
                        />
                    </StyledTitleContainer>
                    <StyledSecondaryLabel>No strategies</StyledSecondaryLabel>
                </StyledAccordionSummary>
            </StyledAccordion>
        );
    }

    return (
        <StyledAccordion status={status}>
            <StyledAccordionSummary expandIcon={<ExpandMore />}>
                <StyledTitleContainer>
                    <StyledTitle>{milestone.name}</StyledTitle>
                    <ReleasePlanMilestoneStatus
                        status={status}
                        onStartMilestone={() => onStartMilestone(milestone)}
                    />
                </StyledTitleContainer>
                <StyledSecondaryLabel>
                    {milestone.strategies.length === 1
                        ? 'View strategy'
                        : `View ${milestone.strategies.length} strategies`}
                </StyledSecondaryLabel>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
                {milestone.strategies.map((strategy, index) => (
                    <div key={strategy.id}>
                        <ConditionallyRender
                            condition={index > 0}
                            show={<StrategySeparator text='OR' />}
                        />
                        <ReleasePlanMilestoneStrategy strategy={strategy} />
                    </div>
                ))}
            </StyledAccordionDetails>
        </StyledAccordion>
    );
};
