import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type { IReleasePlanMilestoneItemProps } from './ReleasePlanMilestoneItem';

interface PendingProgressionChangeResult {
    hasPendingCreate: boolean;
    hasPendingUpdate: boolean;
    hasPendingDelete: boolean;
    effectiveTransitionCondition: IReleasePlanMilestone['transitionCondition'];
}

export const usePendingProgressionChanges = (
    milestone: IReleasePlanMilestone,
    getPendingProgressionChange: IReleasePlanMilestoneItemProps['getPendingProgressionChange'],
): PendingProgressionChangeResult => {
    const pendingProgressionChange = getPendingProgressionChange(milestone.id);

    const hasPendingCreate =
        pendingProgressionChange?.action === 'createMilestoneProgression';
    const hasPendingUpdate =
        pendingProgressionChange?.action === 'updateMilestoneProgression';
    const hasPendingDelete =
        pendingProgressionChange?.action === 'deleteMilestoneProgression';

    // Determine effective transition condition (use pending create if exists)
    let effectiveTransitionCondition = milestone.transitionCondition;
    if (
        pendingProgressionChange?.action === 'createMilestoneProgression' &&
        'transitionCondition' in pendingProgressionChange.payload &&
        pendingProgressionChange.payload.transitionCondition
    ) {
        effectiveTransitionCondition =
            pendingProgressionChange.payload.transitionCondition;
    }

    return {
        hasPendingCreate,
        hasPendingUpdate,
        hasPendingDelete,
        effectiveTransitionCondition,
    };
};
