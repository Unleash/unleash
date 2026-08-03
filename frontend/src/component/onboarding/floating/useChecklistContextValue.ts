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

// Targets the `default` project — the one every fresh instance ships with.
export const CHECKLIST_PROJECT_ID = 'default';

export type ChecklistStepKey = 'tour' | 'flag' | 'sdk' | 'on';

export interface FloatingOnboardingChecklistContextValue {
    state: FloatingOnboardingChecklistState;
    update: (patch: Partial<FloatingOnboardingChecklistState>) => void;
    markCompleted: (step: keyof FloatingOnboardingChecklistCompleted) => void;
    open: () => void;
    dismissed: boolean;
    projectId: string;
    // Single source of truth for how many steps exist, so the badge and the
    // step list can't disagree (e.g. `tour` is opt-in behind a flag).
    visibleSteps: ChecklistStepKey[];
    done: Record<ChecklistStepKey, boolean>;
    completedCount: number;
    totalSteps: number;
    environments: string[];
    refetchOverview: () => void;
}

// Returns `null` for ineligible users. `useProjectOverview` is skipped via
// empty-id short-circuit so ineligible users pay nothing; the feature list is
// fetched deeper in the tree for the same reason.
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
            loading,
            error: projectError,
            refetch: refetchOverview,
        } = useProjectOverview(eligible ? projectId : '');

        const environments = useMemo(
            () => (project.environments ?? []).map((env) => env.environment),
            [project.environments],
        );

        // `tour`/`flag` merge a local bridge tick with the server signal so
        // a fresh completion doesn't flicker while the server catches up.
        // `sdk`/`on` are server-only — closing the SDK dialog isn't proof
        // anyone connected, and turning a flag on happens outside our flow.
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

        // Hide while loading — `useProjectOverview`'s fallback status is
        // `'onboarded'`, which would flash the checklist as fully complete.
        // Hide on error too: the `default` project may be gone on this
        // instance, and we'd otherwise render dead links.
        if (!eligible || projectError || loading) return null;

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
