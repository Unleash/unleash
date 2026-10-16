import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import type { CreateFeatureStrategySchema } from 'openapi';

const FALLBACK_DEFAULT_STRATEGY: CreateFeatureStrategySchema = {
    name: 'flexibleRollout',
    title: '100% of all users',
};

export const useEnvironmentDefaultStrategy = (
    projectId: string,
    environmentId: string,
) => {
    const { project, loading } = useProjectOverview(projectId);

    const defaultStrategy =
        project?.environments?.find((env) => env.environment === environmentId)
            ?.defaultStrategy || FALLBACK_DEFAULT_STRATEGY;

    return { defaultStrategy, loading };
};
