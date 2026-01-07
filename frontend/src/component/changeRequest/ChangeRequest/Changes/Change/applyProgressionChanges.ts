import type { IReleasePlan } from 'interfaces/releasePlans';
import type {
    IChangeRequestChangeMilestoneProgression,
    IChangeRequestDeleteMilestoneProgression,
} from 'component/changeRequest/changeRequest.types';

type ProgressionChange =
    | IChangeRequestChangeMilestoneProgression
    | IChangeRequestDeleteMilestoneProgression;

export const applyProgressionChanges = (
    basePlan: IReleasePlan,
    progressionChanges: ProgressionChange[],
): IReleasePlan => {
    return {
        ...basePlan,
        milestones: basePlan.milestones.map((milestone) => {
            const changeProgression = progressionChanges.find(
                (change): change is IChangeRequestChangeMilestoneProgression =>
                    change.action === 'changeMilestoneProgression' &&
                    change.payload.sourceMilestone === milestone.id,
            );
            const deleteChange = progressionChanges.find(
                (change): change is IChangeRequestDeleteMilestoneProgression =>
                    change.action === 'deleteMilestoneProgression' &&
                    change.payload.sourceMilestone === milestone.id,
            );

            if (deleteChange) {
                return {
                    ...milestone,
                    transitionCondition: null,
                };
            }

            if (changeProgression) {
                return {
                    ...milestone,
                    transitionCondition:
                        changeProgression.payload.transitionCondition,
                };
            }
            return milestone;
        }),
    };
};
