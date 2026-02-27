import type {
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
    IChangeRequestUpdateMilestoneStrategy,
} from 'component/changeRequest/changeRequest.types';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';

export const useCurrentStrategy = (
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy
        | IChangeRequestUpdateMilestoneStrategy,
    project: string,
    feature: string,
    environmentName: string,
) => {
    const { feature: currentFeature } = useFeature(project, feature);
    const environment = currentFeature?.environments.find(
        (env) => env.name === environmentName,
    );

    if (change.action === 'updateMilestoneStrategy') {
        return environment?.releasePlans
            ?.flatMap((plan) => plan.milestones)
            .flatMap((milestone) => milestone.strategies)
            .find(
                (strategy) =>
                    'id' in change.payload && strategy.id === change.payload.id,
            );
    }

    const currentStrategy = environment?.strategies.find(
        (strategy) =>
            'id' in change.payload && strategy.id === change.payload.id,
    );
    return currentStrategy;
};
