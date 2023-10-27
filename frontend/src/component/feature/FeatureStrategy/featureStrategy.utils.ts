import { IFeatureToggle } from 'interfaces/featureToggle';
import { deepOmit, DeepOmit } from '../../../utils/deepOmit';

export const comparisonModerator = (
    data: IFeatureToggle,
): DeepOmit<IFeatureToggle, keyof IFeatureToggle> => {
    const tempData = { ...data };

    return deepOmit(tempData, 'lastSeenAt');
};
