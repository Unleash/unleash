import { useReleasePlans } from '../useReleasePlans/useReleasePlans.js';
import { useFeature } from '../useFeature/useFeature.js';

export const useFeatureReleasePlans = (
    projectId: string,
    featureId: string,
    environmentName?: string,
) => {
    const { loading: releasePlansLoading, ...rest } = useReleasePlans(
        projectId,
        featureId,
        environmentName,
    );
    const {
        feature,
        refetchFeature,
        loading: featureLoading,
    } = useFeature(projectId, featureId);

    const matchingEnvironment = feature?.environments?.find(
        (env) => env.name === environmentName,
    );
    const releasePlans = matchingEnvironment?.releasePlans || [];

    return {
        ...rest,
        releasePlans,
        refetch: refetchFeature,
        loading: featureLoading || releasePlansLoading,
    };
};
