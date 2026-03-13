import { useFeature } from '../useFeature/useFeature.js';

export const useFeatureReleasePlans = (
    projectId: string,
    featureId: string,
    environmentName?: string,
) => {
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
        releasePlans,
        refetch: refetchFeature,
        loading: featureLoading,
    };
};
