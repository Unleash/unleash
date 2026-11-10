import type {
    IFeatureSearchOverview,
    IFlagResolver,
} from '../../types/index.js';
import { anonymise } from '../../util/index.js';

export const maybeAnonymiseEventLog = <T extends IFeatureSearchOverview>(
    flagResolver: IFlagResolver,
    features: T[],
): T[] => {
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
