import type { IReleasePlan } from 'interfaces/releasePlans';
import type {
    IChangeRequestCreateMilestoneProgression,
    IChangeRequestUpdateMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
} from 'component/changeRequest/changeRequest.types';

type ProgressionChange =
    | IChangeRequestCreateMilestoneProgression
    | IChangeRequestUpdateMilestoneProgression
    | IChangeRequestDeleteMilestoneProgression;

export const useModifiedReleasePlan = (
    basePlan: IReleasePlan,
    progressionChanges: ProgressionChange[],
): IReleasePlan => {
    return {
        ...basePlan,
        milestones: basePlan.milestones.map((milestone) => {
            // Find if there's a progression change for this milestone
            const createChange = progressionChanges.find(
                (change): change is IChangeRequestCreateMilestoneProgression =>
                    change.action === 'createMilestoneProgression' &&
                    change.payload.sourceMilestone === milestone.id,
            );
            const updateChange = progressionChanges.find(
                (change): change is IChangeRequestUpdateMilestoneProgression =>
                    change.action === 'updateMilestoneProgression' &&
                    (change.payload.sourceMilestoneId === milestone.id ||
                        change.payload.sourceMilestone === milestone.id),
            );
            const deleteChange = progressionChanges.find(
                (change): change is IChangeRequestDeleteMilestoneProgression =>
                    change.action === 'deleteMilestoneProgression' &&
                    (change.payload.sourceMilestoneId === milestone.id ||
                        change.payload.sourceMilestone === milestone.id),
            );

            // Check for conflicting changes (delete + create/update for same milestone)
            if (deleteChange && (createChange || updateChange)) {
                console.warn(
                    '[useModifiedReleasePlan] Conflicting changes detected for milestone:',
                    {
                        milestone: milestone.name,
                        hasCreate: !!createChange,
                        hasUpdate: !!updateChange,
                        hasDelete: !!deleteChange,
                    },
                );
            }

            // If there's a delete change, remove the transition condition
            // Delete takes precedence over create/update
            if (deleteChange) {
                return {
                    ...milestone,
                    transitionCondition: null,
                };
            }

            const change = updateChange || createChange;
            if (change) {
                return {
                    ...milestone,
                    transitionCondition: change.payload.transitionCondition,
                };
            }
            return milestone;
        }),
    };
};
