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

export const applyProgressionChanges = (
    basePlan: IReleasePlan,
    progressionChanges: ProgressionChange[],
): IReleasePlan => {
    return {
        ...basePlan,
        milestones: basePlan.milestones.map((milestone) => {
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
