import type {
    IChangeRequestAddStrategy,
    IChangeRequestDeleteStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';

export const useCurrentStrategy = (
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestDeleteStrategy,
    project: string,
    feature: string,
    environmentName: string,
) => {
    const { feature: currentFeature } = useFeature(project, feature);
    const environment = currentFeature?.environments.find(
        (env) => env.name === environmentName,
    );

    const currentStrategy = environment?.strategies.find(
        (strategy) =>
            'id' in change.payload && strategy.id === change.payload.id,
    );
    return currentStrategy;
};
