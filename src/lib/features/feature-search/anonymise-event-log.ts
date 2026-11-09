import type {
    IFeatureSearchOverview,
    IFlagResolver,
} from '../../types/index.js';
import { anonymise } from '../../util/index.js';

export const maybeAnonymiseEventLog = (
    flagResolver: IFlagResolver,
    features: IFeatureSearchOverview[],
): IFeatureSearchOverview[] => {
    if (flagResolver.isEnabled('anonymiseEventLog')) {
        return features.map((feature) => ({
            ...feature,
            createdBy: {
                ...feature.createdBy,
                name: anonymise(feature.createdBy.name),
            },
        }));
    }
    return features;
};
