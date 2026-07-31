import { useMemo } from 'react';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useUiFlag } from 'hooks/useUiFlag';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash.ts';
import { getProjectOnboardingStep } from 'utils/getProjectOnboardingStep.ts';
import {
    type FloatingOnboardingChecklistCompleted,
    type FloatingOnboardingChecklistState,
    useFloatingOnboardingChecklistState,
} from './floatingOnboardingChecklistState.ts';
import {
    ONBOARDING_CHECKLIST_SPLASH_ID,
    useOnboardingChecklistEligibility,
} from './useOnboardingChecklistEligibility.ts';

/**
 * The checklist targets the `default` project — created for every new
 * instance. Users on invited instances / multi-project setups are out of
 * scope for the onboarding checklist.
 */
export const CHECKLIST_PROJECT_ID = 'default';

export interface FloatingOnboardingChecklistContextValue {
    state: FloatingOnboardingChecklistState;
    update: (patch: Partial<FloatingOnboardingChecklistState>) => void;
    markCompleted: (step: keyof FloatingOnboardingChecklistCompleted) => void;
    /** Bring the helper back into view (used from the header menu). */
    open: () => void;
    /**
     * Whether the checklist should stay hidden. The local `state.dismissed`
     * (this session) wins if set; otherwise falls back to the server-
     * persisted splash so dismissal survives a localStorage reset.
     */
    dismissed: boolean;
    projectId: string;
    quickTourEnabled: boolean;
    done: { tour: boolean; flag: boolean; sdk: boolean; on: boolean };
    completedCount: number;
    totalSteps: number;
    environments: string[];
    refetchOverview: () => void;
}

/**
 * Builds the context value for eligible users, or returns `null` for
 * everyone else. Only cheap data is fetched here: `useProjectOverview` uses
 * `useConditionalSWR` and skips fetching when we pass an empty id, so
 * ineligible users pay nothing. The feature list (needed to build the
 * "Go to flag" link and pre-fill the SDK dialog) is fetched inside the
 * eligible-only component to keep this global provider zero-cost for
 * everyone else.
 */
export const useChecklistContextValue =
    (): FloatingOnboardingChecklistContextValue | null => {
        const eligible = useOnboardingChecklistEligibility();
        const { state, update, markCompleted } =
            useFloatingOnboardingChecklistState();
        const { splash } = useAuthSplash();
        const quickTourEnabled = useUiFlag('quickTourDemo');
        const projectId = CHECKLIST_PROJECT_ID;

        const splashDismissed = Boolean(
            splash?.[ONBOARDING_CHECKLIST_SPLASH_ID],
        );
        const dismissed = state.dismissed ?? splashDismissed;

        const {
            project,
            error: projectError,
            refetch: refetchOverview,
        } = useProjectOverview(eligible ? projectId : '');

        const environments = useMemo(
            () => (project.environments ?? []).map((env) => env.environment),
            [project.environments],
        );

        // Local `completed` is the fast/optimistic path, but localStorage is
        // cleared on logout — fall back to the server's onboardingStatus so a
        // user who logs back in doesn't have to redo flag/sdk/on. Tour has no
        // server signal, so it resets on logout (acceptable — cheap to redo).
        const serverStep = getProjectOnboardingStep(
            project.onboardingStatus,
        ).current;
        const done = {
            tour: Boolean(state.completed.tour),
            flag: Boolean(state.completed.flag) || serverStep >= 1,
            sdk: Boolean(state.completed.sdk) || serverStep >= 2,
            on: Boolean(state.completed.on) || serverStep >= 3,
        };
        const totalSteps = quickTourEnabled ? 4 : 3;
        const trackedDone = quickTourEnabled
            ? [done.tour, done.flag, done.sdk, done.on]
            : [done.flag, done.sdk, done.on];
        const completedCount = trackedDone.filter(Boolean).length;

        // If the `default` project can't be loaded (deleted/renamed on this
        // instance), treat as ineligible — we'd otherwise render dead links
        // to `/projects/default/...`.
        if (!eligible || projectError) return null;

        return {
            state,
            update,
            markCompleted,
            open: () => update({ dismissed: false, minimized: false }),
            dismissed,
            projectId,
            quickTourEnabled,
            done,
            completedCount,
            totalSteps,
            environments,
            refetchOverview,
        };
    };
