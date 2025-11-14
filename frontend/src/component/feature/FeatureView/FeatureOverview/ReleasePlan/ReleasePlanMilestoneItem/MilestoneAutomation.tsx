import Add from '@mui/icons-material/Add';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { Badge } from 'component/common/Badge/Badge';
import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import { MilestoneAutomationSection } from '../ReleasePlanMilestone/MilestoneAutomationSection.tsx';
import { MilestoneTransitionDisplay } from '../ReleasePlanMilestone/MilestoneTransitionDisplay.tsx';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import { MilestoneProgressionForm } from '../MilestoneProgressionForm/MilestoneProgressionForm.tsx';
import type { PendingProgressionChange } from './ReleasePlanMilestoneItem.tsx';
import { StyledActionButton } from './StyledActionButton.tsx';

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

    const hasPendingChange =
        pendingProgressionChange?.action === 'changeMilestoneProgression';
    const hasPendingDelete =
        pendingProgressionChange?.action === 'deleteMilestoneProgression';
    const isPaused = Boolean(milestone.pausedAt);

    const badge = hasPendingDelete ? (
        <Badge color='error'>Deleted in draft</Badge>
    ) : hasPendingChange ? (
        <Badge color='warning'>Modified in draft</Badge>
    ) : isPaused ? (
        <Badge color='error' icon={<WarningAmber fontSize='small' />}>
            Paused
        </Badge>
    ) : undefined;

    return (
        <MilestoneAutomationSection status={status}>
            {isProgressionFormOpen ? (
                <MilestoneProgressionForm
                    sourceMilestoneId={milestone.id}
                    targetMilestoneId={nextMilestoneId}
                    sourceMilestoneStartedAt={milestone.startedAt}
                    status={status}
                    onSubmit={onChangeProgression}
                    onCancel={onCloseProgressionForm}
                />
            ) : effectiveTransitionCondition ? (
                <MilestoneTransitionDisplay
                    intervalMinutes={
                        effectiveTransitionCondition.intervalMinutes
                    }
                    targetMilestoneId={nextMilestoneId}
                    sourceMilestoneStartedAt={milestone.startedAt}
                    onSave={onChangeProgression}
                    onDelete={() => onDeleteProgression(milestone)}
                    milestoneName={milestone.name}
                    status={status}
                    badge={badge}
                />
            ) : (
                <StyledActionButton
                    onClick={onOpenProgressionForm}
                    color='primary'
                    startIcon={<Add />}
                >
                    Add automation
                </StyledActionButton>
            )}
        </MilestoneAutomationSection>
    );
};
