import Add from '@mui/icons-material/Add';
import { Button, styled } from '@mui/material';
import { Badge } from 'component/common/Badge/Badge';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import { MilestoneAutomationSection } from '../ReleasePlanMilestone/MilestoneAutomationSection.tsx';
import { MilestoneTransitionDisplay } from '../ReleasePlanMilestone/MilestoneTransitionDisplay.tsx';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { MilestoneProgressionForm } from '../MilestoneProgressionForm/MilestoneProgressionForm.tsx';
import type { PendingProgressionChange } from './ReleasePlanMilestoneItem.tsx';

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

const StyledAddAutomationContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

interface MilestoneAutomationProps {
    milestone: IReleasePlanMilestone;
    status: MilestoneStatus;
    isNotLastMilestone: boolean;
    nextMilestoneId: string;
    milestoneProgressionsEnabled: boolean;
    readonly: boolean | undefined;
    isProgressionFormOpen: boolean;
    effectiveTransitionCondition: IReleasePlanMilestone['transitionCondition'];
    pendingProgressionChange: PendingProgressionChange | null;
    onOpenProgressionForm: () => void;
    onCloseProgressionForm: () => void;
    onChangeProgression: (
        payload: ChangeMilestoneProgressionSchema,
    ) => Promise<{ shouldReset?: boolean }>;
    onDeleteProgression: (milestone: IReleasePlanMilestone) => void;
}

export const MilestoneAutomation = ({
    milestone,
    status,
    isNotLastMilestone,
    nextMilestoneId,
    milestoneProgressionsEnabled,
    readonly,
    isProgressionFormOpen,
    effectiveTransitionCondition,
    pendingProgressionChange,
    onOpenProgressionForm,
    onCloseProgressionForm,
    onChangeProgression,
    onDeleteProgression,
}: MilestoneAutomationProps) => {
    const showAutomation =
        milestoneProgressionsEnabled && isNotLastMilestone && !readonly;

    if (!showAutomation) {
        return null;
    }

    // When milestone has no original transitionCondition but has a pending changeMilestoneProgression, it's a create
    const isOriginallyEmpty = !milestone.transitionCondition;
    const hasPendingCreate =
        isOriginallyEmpty &&
        pendingProgressionChange?.action === 'changeMilestoneProgression';
    const hasPendingChange =
        !isOriginallyEmpty &&
        pendingProgressionChange?.action === 'changeMilestoneProgression';
    const hasPendingDelete =
        pendingProgressionChange?.action === 'deleteMilestoneProgression';

    const badge = hasPendingDelete ? (
        <Badge color='error'>Deleted in draft</Badge>
    ) : hasPendingChange || hasPendingCreate ? (
        <Badge color='warning'>Modified in draft</Badge>
    ) : undefined;

    return (
        <MilestoneAutomationSection status={status}>
            {isProgressionFormOpen ? (
                <MilestoneProgressionForm
                    sourceMilestoneId={milestone.id}
                    targetMilestoneId={nextMilestoneId}
                    onSubmit={onChangeProgression}
                    onCancel={onCloseProgressionForm}
                />
            ) : effectiveTransitionCondition ? (
                <MilestoneTransitionDisplay
                    intervalMinutes={
                        effectiveTransitionCondition.intervalMinutes
                    }
                    targetMilestoneId={nextMilestoneId}
                    onSave={onChangeProgression}
                    onDelete={() => onDeleteProgression(milestone)}
                    milestoneName={milestone.name}
                    status={status}
                    badge={badge}
                />
            ) : (
                <StyledAddAutomationContainer>
                    <StyledAddAutomationButton
                        onClick={onOpenProgressionForm}
                        color='primary'
                        startIcon={<Add />}
                    >
                        Add automation
                    </StyledAddAutomationButton>
                    {hasPendingCreate && (
                        <Badge color='warning'>Modified in draft</Badge>
                    )}
                </StyledAddAutomationContainer>
            )}
        </MilestoneAutomationSection>
    );
};
