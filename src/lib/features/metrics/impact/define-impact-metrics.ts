import type { IFlagResolver } from '../../../types/index.js';

export const FEAUTRE_LINK_COUNT = 'feature_link_count';

export const defineImpactMetrics = (flagResolver: IFlagResolver) => {
    flagResolver.impactMetrics?.defineCounter(
        FEAUTRE_LINK_COUNT,
        'Count of feature links',
    );
};
