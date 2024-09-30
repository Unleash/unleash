import type { IFeatureToggle } from 'interfaces/featureToggle';
import { deepOmit, type DeepOmit } from '../../../utils/deepOmit';

export const comparisonModerator = (
    data: IFeatureToggle,
): DeepOmit<IFeatureToggle, keyof IFeatureToggle> => {
    const tempData = { ...data };

    return deepOmit(
        tempData,
        'lastSeenAt',
        'yes',
        'no',
        'lifecycle',
        'collaborators',
    );
};
