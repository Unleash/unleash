import { useUiFlag } from 'hooks/useUiFlag';
import { useReleasePlans } from '../useReleasePlans/useReleasePlans.js';
import { useFeature } from '../useFeature/useFeature.js';

export const useFeatureReleasePlans = (
    projectId: string,
    featureId: string,
    environmentName?: string,
) => {
    const featureReleasePlansEnabled = useUiFlag('featureReleasePlans');
    const {
        releasePlans: releasePlansFromHook,
        refetch: refetchReleasePlans,
        ...rest
    } = useReleasePlans(projectId, featureId, environmentName);
    const { feature, refetchFeature } = useFeature(projectId, featureId);

    let releasePlans = releasePlansFromHook;

    if (featureReleasePlansEnabled) {
        const matchingEnvironment = feature?.environments?.find(
            (env) => env.name === environmentName,
        );
        releasePlans = matchingEnvironment?.releasePlans || [];
    }

    const refetch = featureReleasePlansEnabled
        ? refetchFeature
        : refetchReleasePlans;

    return { releasePlans, refetch, ...rest };
};
