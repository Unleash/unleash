import type { OnboardingStatusSchema } from 'openapi';

const NUMBER_OF_STEPS = 3;

export const getOnboardingStep = (
    status: OnboardingStatusSchema | undefined,
) => {
    const value = status?.status;
    const isFirstFlagCreated = value === 'first-flag-created';
    const isSDKConnected = value === 'sdk-connected';
    const isOnboarded = value === 'onboarded';

    let step = 0;
    if (isOnboarded) {
        step = NUMBER_OF_STEPS;
    } else if (isSDKConnected) {
        step = 2;
    } else if (isFirstFlagCreated) {
        step = 1;
    }
    return { current: step, total: NUMBER_OF_STEPS };
};
