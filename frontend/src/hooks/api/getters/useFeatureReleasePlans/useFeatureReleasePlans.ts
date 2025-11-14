import { useUiFlag } from 'hooks/useUiFlag';
import { useReleasePlans } from '../useReleasePlans/useReleasePlans.js';
import { useFeature } from '../useFeature/useFeature.js';

export const useFeatureReleasePlans = (
    projectId: string,
    featureId: string,
    environmentName?: string,
) => {
    const featureReleasePlansEnabled = useUiFlag('featureReleasePlans');

    const { feature, refetchFeature } = useFeature(projectId, featureId);
    const {
        releasePlans: releasePlansFromHook,
        refetch: refetchReleasePlans,
        ...rest
    } = useReleasePlans(projectId, featureId, environmentName);

    const matchingEnvironment = feature?.environments?.find(
        (env) => env.name === environmentName,
    );
    const releasePlans = matchingEnvironment?.releasePlans || [];

    if (!featureReleasePlansEnabled) {
        const releasePlans = releasePlansFromHook;
    }

    const refetch = featureReleasePlansEnabled
        ? refetchFeature
        : refetchReleasePlans;

    return { releasePlans, refetch, ...rest };
};
