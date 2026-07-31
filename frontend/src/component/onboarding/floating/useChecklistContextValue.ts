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
    ONBOARDING_TOUR_SPLASH_ID,
    useOnboardingChecklistEligibility,
} from './useOnboardingChecklistEligibility.ts';

/**
 * The checklist targets the `default` project — created for every new
 * instance. Users on invited instances / multi-project setups are out of
 * scope for the onboarding checklist.
 */
export const CHECKLIST_PROJECT_ID = 'default';

export type ChecklistStepKey = 'tour' | 'flag' | 'sdk' | 'on';

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
    /**
     * Ordered list of step keys that should be shown and counted for this
     * user (e.g. `tour` is opt-in behind a flag). Single source of truth so
     * the badge and the step list can't disagree on how many steps exist.
     */
    visibleSteps: ChecklistStepKey[];
    done: Record<ChecklistStepKey, boolean>;
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

        // `tour` and `flag` merge a local bridge tick with the server so
        // a fresh completion doesn't flicker while the server state
        // (splash for tour, `onboardingStatus` for flag) catches up.
        // `sdk`/`on` are server-only — no reliable local proof (closing
        // the SDK dialog isn't evidence anyone connected, and turning a
        // flag on happens outside our flow).
        const serverStep = getProjectOnboardingStep(
            project.onboardingStatus,
        ).current;
        const tourSplashSeen = Boolean(splash?.[ONBOARDING_TOUR_SPLASH_ID]);
        const done: Record<ChecklistStepKey, boolean> = {
            tour: Boolean(state.completed.tour) || tourSplashSeen,
            flag: Boolean(state.completed.flag) || serverStep >= 1,
            sdk: serverStep >= 2,
            on: serverStep >= 3,
        };
        const visibleSteps: ChecklistStepKey[] = quickTourEnabled
            ? ['tour', 'flag', 'sdk', 'on']
            : ['flag', 'sdk', 'on'];
        const totalSteps = visibleSteps.length;
        const completedCount = visibleSteps.filter((key) => done[key]).length;

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
            visibleSteps,
            done,
            completedCount,
            totalSteps,
            environments,
            refetchOverview,
        };
    };
