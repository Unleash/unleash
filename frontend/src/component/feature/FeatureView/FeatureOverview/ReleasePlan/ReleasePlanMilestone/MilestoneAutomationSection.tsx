import { styled } from '@mui/material';
import type { MilestoneStatus } from './ReleasePlanMilestoneStatus.tsx';

const StyledAutomationContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: MilestoneStatus }>(({ theme, status }) => ({
    border: `${status?.type === 'active' ? '1.5px' : '1px'} solid ${status?.type === 'active' ? theme.palette.success.border : theme.palette.divider}`,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderRadius: `0 0 ${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px`,
    padding: theme.spacing(1.5, 2),
    paddingLeft: theme.spacing(2.25),
    backgroundColor:
        status?.type === 'completed'
            ? theme.palette.background.default
            : theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(1),
    '& > *': {
        alignSelf: 'flex-start',
    },
}));

interface IMilestoneAutomationSectionProps {
    status?: MilestoneStatus;
    children: React.ReactNode;
}

export const MilestoneAutomationSection = ({
    status,
    children,
}: IMilestoneAutomationSectionProps) => {
    return (
        <StyledAutomationContainer status={status}>
            {children}
        </StyledAutomationContainer>
    );
};
