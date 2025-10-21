import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type {
    IReleasePlanMilestoneItemProps,
    PendingProgressionChange,
} from './ReleasePlanMilestoneItem';

interface PendingProgressionChangeResult {
    pendingProgressionChange: PendingProgressionChange | null;
    effectiveTransitionCondition: IReleasePlanMilestone['transitionCondition'];
}

export const usePendingProgressionChanges = (
    milestone: IReleasePlanMilestone,
    getPendingProgressionChange: IReleasePlanMilestoneItemProps['getPendingProgressionChange'],
): PendingProgressionChangeResult => {
    const pendingProgressionChange = getPendingProgressionChange(milestone.id);

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
        pendingProgressionChange,
        effectiveTransitionCondition,
    };
};
