import { IFeatureToggle } from 'interfaces/featureToggle';

export const comparisonModerator = (data: IFeatureToggle) => {
    const tempData = { ...data };
    delete tempData.lastSeenAt;

    return tempData;
};
