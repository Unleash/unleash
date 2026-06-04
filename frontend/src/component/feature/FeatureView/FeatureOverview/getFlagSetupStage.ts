import type {
    FeatureSchemaLifecycleStage,
    FeatureStrategySchema,
    ProjectOverviewSchema,
} from 'openapi';

export type FlagSetupStage =
    | 'connect-sdk'
    | 'implement-flag'
    | 'add-strategy'
    | null;

export const getFlagSetupStage = (
    projectOnboarding:
        | { status: ProjectOverviewSchema['onboardingStatus']['status'] }
        | undefined,
    feature:
        | {
              lifecycle?: {
                  stage: FeatureSchemaLifecycleStage;
              };
              environments?: { strategies?: FeatureStrategySchema[] }[];
          }
        | undefined,
): FlagSetupStage => {
    const status = projectOnboarding?.status;
    if (status !== 'onboarded' && status !== 'sdk-connected') {
        return 'connect-sdk';
    }

    // The SDK is connected but the flag hasn't been evaluated yet (initial =
    // created, no metrics — see backend feature-lifecycle-service.ts
    // featureInitialized), so prompt to wrap it in code. Missing lifecycle is
    // treated the same.
    const stage = feature?.lifecycle?.stage;
    if (!stage || stage === 'initial') {
        return 'implement-flag';
    }

    // pre-live/live are the stages set once a flag has received metrics — see
    // backend feature-lifecycle-service.ts (featuresReceivedMetrics).
    const receivingMetrics = stage === 'pre-live' || stage === 'live';
    const noStrategies = (feature?.environments ?? []).every(
        (env) => env.strategies?.length === 0,
    );

    if (receivingMetrics && noStrategies) {
        return 'add-strategy';
    }

    return null;
};
