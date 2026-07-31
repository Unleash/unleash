import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';

/**
 * Fetches the first feature in the given project. Kept out of the global
 * context so ineligible users don't pay for a feature-search request on
 * every page load. `goToFlagHref` is `null` when the project has no
 * features so callers can disable "Go to flag" affordances instead of
 * dumping the user on the project page with no flag context.
 */
export const useFirstProjectFeature = (projectId: string) => {
    const { features } = useFeatureSearch({ project: `IS:${projectId}` });
    const feature = features[0]?.name;
    const goToFlagHref = feature
        ? `/projects/${projectId}/features/${feature}`
        : null;
    return { feature, goToFlagHref };
};
