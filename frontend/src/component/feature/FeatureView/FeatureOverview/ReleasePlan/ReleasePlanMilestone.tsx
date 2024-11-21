import ExpandMore from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    styled,
} from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

type MilestoneStatus = 'not-started' | 'active' | 'completed';

const StyledAccordion = styled(Accordion, {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: MilestoneStatus }>(({ theme, status }) => ({
    border: `1px solid ${status === 'active' ? theme.palette.success.border : theme.palette.divider}`,
    boxShadow: 'none',
    margin: 0,
    backgroundColor: theme.palette.background.paper,
}));

const StyledAccordionSummary = styled(AccordionSummary)({
    '& .MuiAccordionSummary-content': {
        justifyContent: 'space-between',
        alignItems: 'center',
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

const StyledStatus = styled('div', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status: MilestoneStatus }>(({ theme, status }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingRight: theme.spacing(1),
    fontSize: theme.fontSizes.smallerBody,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor:
        status === 'active' ? theme.palette.success.light : 'transparent',
    color:
        status === 'active'
            ? theme.palette.success.contrastText
            : status === 'completed'
              ? theme.palette.text.secondary
              : theme.palette.text.primary,
    '& svg': {
        color:
            status === 'active'
                ? theme.palette.success.main
                : status === 'completed'
                  ? theme.palette.neutral.border
                  : theme.palette.primary.main,
    },
}));

const StyledSecondaryLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
}));

interface IReleasePlanMilestoneProps {
    milestone: IReleasePlanMilestone;
    status: MilestoneStatus;
}

export const ReleasePlanMilestone = ({
    milestone,
    status,
}: IReleasePlanMilestoneProps) => {
    const statusText =
        status === 'active'
            ? 'Running'
            : status === 'completed'
              ? 'Restart'
              : 'Start';

    return (
        <StyledAccordion status={status}>
            <StyledAccordionSummary expandIcon={<ExpandMore />}>
                <StyledTitleContainer>
                    <StyledTitle>{milestone.name}</StyledTitle>
                    <StyledStatus status={status}>
                        <ConditionallyRender
                            condition={status === 'active'}
                            show={<TripOriginIcon />}
                            elseShow={<PlayCircleIcon />}
                        />
                        <span>{statusText}</span>
                    </StyledStatus>
                </StyledTitleContainer>
                <StyledSecondaryLabel>View strategies</StyledSecondaryLabel>
            </StyledAccordionSummary>
            <AccordionDetails>
                You'll be able to see the milestone strategies (
                {milestone.strategies.length}) here sometime soon
            </AccordionDetails>
        </StyledAccordion>
    );
};
