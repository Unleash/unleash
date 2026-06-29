import type { FeatureSchema, ProjectOverviewSchema } from 'openapi';

export type FeatureSetupStage =
    | 'connect-sdk'
    | 'implement-flag'
    | 'add-strategy'
    | 'setup-completed';

export const getFeatureSetupStage = ({
    projectOnboardingStatus,
    feature,
}: {
    projectOnboardingStatus?: ProjectOverviewSchema['onboardingStatus']['status'];
    feature?: Pick<FeatureSchema, 'lifecycle' | 'environments'>;
}): FeatureSetupStage => {
    if (
        projectOnboardingStatus !== 'onboarded' &&
        projectOnboardingStatus !== 'sdk-connected'
    ) {
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
    const noStrategies = (feature.environments ?? []).every(
        (env) => env.strategies?.length === 0,
    );

    if (receivingMetrics && noStrategies) {
        return 'add-strategy';
    }

    return 'setup-completed';
};
