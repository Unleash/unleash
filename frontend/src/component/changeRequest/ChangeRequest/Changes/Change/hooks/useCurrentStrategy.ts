import {
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
    environmentName: string
) => {
    const currentFeature = useFeature(project, feature);
    const currentStrategy = currentFeature.feature?.environments
        .find(environment => environment.name === environmentName)
        ?.strategies.find(
            strategy =>
                'id' in change.payload && strategy.id === change.payload.id
        );
    return currentStrategy;
};
