import type { IReleasePlanMilestone } from 'interfaces/releasePlans';
import type {
    IReleasePlanMilestoneItemProps,
    PendingProgressionChange,
} from './ReleasePlanMilestoneItem.jsx';

interface PendingProgressionChangeResult {
    pendingProgressionChange: PendingProgressionChange | null;
    effectiveTransitionCondition: IReleasePlanMilestone['transitionCondition'];
}

export const getPendingProgressionData = (
    milestone: IReleasePlanMilestone,
    getPendingProgressionChange: IReleasePlanMilestoneItemProps['getPendingProgressionChange'],
): PendingProgressionChangeResult => {
    const pendingProgressionChange = getPendingProgressionChange(milestone.id);

    // Determine effective transition condition (use pending change if exists)
    let effectiveTransitionCondition = milestone.transitionCondition;
    if (
        pendingProgressionChange?.action === 'changeMilestoneProgression' &&
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
