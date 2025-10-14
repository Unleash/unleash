import Add from '@mui/icons-material/Add';
import { Button, styled } from '@mui/material';
import type { MilestoneStatus } from './ReleasePlanMilestoneStatus.tsx';
import { MilestoneTransitionDisplay } from './MilestoneTransitionDisplay.tsx';

const StyledAutomationContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: MilestoneStatus }>(({ theme, status }) => ({
    border: `${status === 'active' ? '1.25px' : '1px'} solid ${status === 'active' ? theme.palette.success.border : theme.palette.divider}`,
    borderTop: `1px solid ${theme.palette.divider}`,
    borderRadius: `0 0 ${theme.shape.borderRadiusLarge}px ${theme.shape.borderRadiusLarge}px`,
    padding: theme.spacing(1.5, 2),
    backgroundColor:
        status === 'completed'
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

const StyledAddAutomationButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
    padding: 0,
    minWidth: 'auto',
    gap: theme.spacing(1),
    '&:hover': {
        backgroundColor: 'transparent',
    },
    '& .MuiButton-startIcon': {
        margin: 0,
        width: 20,
        height: 20,
        border: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.background.elevation2,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
            fontSize: 14,
            color: theme.palette.primary.main,
        },
    },
}));

interface IMilestoneAutomationSectionProps {
    showAutomation?: boolean;
    status?: MilestoneStatus;
    onAddAutomation?: () => void;
    onDeleteAutomation?: () => void;
    automationForm?: React.ReactNode;
    transitionCondition?: {
        intervalMinutes: number;
    } | null;
    milestoneName: string;
    projectId: string;
    environment: string;
    featureName: string;
    sourceMilestoneId: string;
    onUpdate: () => void;
}

export const MilestoneAutomationSection = ({
    showAutomation,
    status,
    onAddAutomation,
    onDeleteAutomation,
    automationForm,
    transitionCondition,
    milestoneName,
    projectId,
    environment,
    featureName,
    sourceMilestoneId,
    onUpdate,
}: IMilestoneAutomationSectionProps) => {
    if (!showAutomation) return null;

    return (
        <StyledAutomationContainer status={status}>
            {automationForm ? (
                automationForm
            ) : transitionCondition ? (
                <MilestoneTransitionDisplay
                    intervalMinutes={transitionCondition.intervalMinutes}
                    onDelete={onDeleteAutomation!}
                    milestoneName={milestoneName}
                    status={status}
                    projectId={projectId}
                    environment={environment}
                    featureName={featureName}
                    sourceMilestoneId={sourceMilestoneId}
                    onUpdate={onUpdate}
                />
            ) : (
                <StyledAddAutomationButton
                    onClick={onAddAutomation}
                    color='primary'
                    startIcon={<Add />}
                >
                    Add automation
                </StyledAddAutomationButton>
            )}
        </StyledAutomationContainer>
    );
};
