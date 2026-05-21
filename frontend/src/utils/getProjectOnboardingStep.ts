import type { OnboardingStatusSchema } from 'openapi';

const NUMBER_OF_STEPS = 3;

const STEP_BY_STATUS: Record<OnboardingStatusSchema['status'], number> = {
    'onboarding-started': 0,
    'first-flag-created': 1,
    'sdk-connected': 2,
    onboarded: NUMBER_OF_STEPS,
};

export const getProjectOnboardingStep = (
    status: OnboardingStatusSchema | undefined,
) => {
    const current = status ? STEP_BY_STATUS[status.status] : 0;
    return { current, total: NUMBER_OF_STEPS };
};
