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

export const mockUserWithSplash = (
    server: SetupServer,
    splash: Record<string, boolean>,
) =>
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [],
        feedback: [],
        splash,
    });

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
