import { useUiFlag } from 'hooks/useUiFlag';
import { useReleasePlans } from '../useReleasePlans/useReleasePlans.js';
import { useFeature } from '../useFeature/useFeature.js';
import type { IFeatureEnvironment } from 'interfaces/featureToggle';

export const useFeatureReleasePlans = (
    projectId: string,
    featureId: string,
    environment?: IFeatureEnvironment | string,
) => {
    const featureReleasePlansEnabled = useUiFlag('featureReleasePlans');
    const envName =
        typeof environment === 'string' ? environment : environment?.name;
    const {
        releasePlans: releasePlansFromHook,
        refetch: refetchReleasePlans,
        ...rest
    } = useReleasePlans(projectId, featureId, envName);
    const { refetchFeature } = useFeature(projectId, featureId);

    const releasePlans = featureReleasePlansEnabled
        ? (typeof environment === 'object' ? environment?.releasePlans : []) ||
          []
        : releasePlansFromHook;

    const refetch = featureReleasePlansEnabled
        ? refetchFeature
        : refetchReleasePlans;

    return { releasePlans, refetch, ...rest };
};
