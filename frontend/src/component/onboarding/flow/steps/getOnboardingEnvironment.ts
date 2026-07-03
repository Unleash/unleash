import type {
    FeatureSearchEnvironmentSchema,
    FeatureSearchResponseSchema,
} from 'openapi';

/**
 * Picks the environment a new user should flip their first flag in:
 * the first development environment, or the first environment otherwise.
 */
export const getOnboardingEnvironment = (
    feature: FeatureSearchResponseSchema | undefined,
): FeatureSearchEnvironmentSchema | undefined => {
    const environments = feature?.environments ?? [];
    return (
        environments.find(
            (environment) => environment.type === 'development',
        ) ?? environments[0]
    );
};
