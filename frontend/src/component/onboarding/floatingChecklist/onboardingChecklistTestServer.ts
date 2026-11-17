import type { SetupServer } from 'msw/node';
import { testServerRoute } from 'utils/testServer';
import { CHECKLIST_PROJECT_ID } from './useChecklistContextValue.ts';
import {
    ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
    ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
} from './useOnboardingChecklistVisibility.ts';

export const CHECKLIST_ELIGIBLE_SPLASH = {
    [ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID]: true,
    [ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID]: true,
};

export const userResponseWithSplash = (
    splash: Record<string, boolean>,
    userId = 1,
) => ({
    user: { id: userId },
    permissions: [],
    feedback: [],
    splash,
});

export const mockUserWithSplash = (
    server: SetupServer,
    splash: Record<string, boolean>,
    userId = 1,
) =>
    testServerRoute(
        server,
        '/api/admin/user',
        userResponseWithSplash(splash, userId),
    );

export const mockChecklistProjectOnboardingStarted = (server: SetupServer) =>
    testServerRoute(
        server,
        `/api/admin/projects/${CHECKLIST_PROJECT_ID}/overview`,
        {
            name: 'Default',
            environments: [],
            onboardingStatus: { status: 'onboarding-started' },
        },
    );
