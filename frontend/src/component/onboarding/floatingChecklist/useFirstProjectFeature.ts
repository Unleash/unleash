import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';

// Kept out of the global context so ineligible users don't pay for the
// feature-search request.
export const useFirstProjectFeature = (projectId: string) => {
    const { features } = useFeatureSearch({ project: `IS:${projectId}` });
    const feature = features[0]?.name;
    const goToFlagHref = feature
        ? `/projects/${projectId}/features/${feature}`
        : null;
    return { feature, goToFlagHref };
};
