import { useMemo, useState } from 'react';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useUiFlag } from 'hooks/useUiFlag';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash.ts';
import { getProjectOnboardingStep } from 'utils/getProjectOnboardingStep.ts';
import {
    type FloatingOnboardingChecklistCompleted,
    type FloatingOnboardingChecklistState,
    useFloatingOnboardingChecklistState,
} from './floatingOnboardingChecklistState.ts';
import { ONBOARDING_INTRO_FINISHED_SPLASH_ID } from 'component/onboarding/intro/IntroProvider.tsx';
import { ONBOARDING_CHECKLIST_SPLASH_ID } from './useOnboardingChecklistEligibility.ts';
import { useOnboardingChecklistVisibility } from './useOnboardingChecklistVisibility.ts';

export const CHECKLIST_PROJECT_ID = 'default';

export type ChecklistStepKey = 'tour' | 'flag' | 'sdk' | 'on';

export interface FloatingOnboardingChecklistContextValue {
    state: FloatingOnboardingChecklistState;
    update: (patch: Partial<FloatingOnboardingChecklistState>) => void;
    markCompleted: (step: keyof FloatingOnboardingChecklistCompleted) => void;
    open: () => void;
    openRequestCounter: number;
    dismissed: boolean;
    projectId: string;
    visibleSteps: ChecklistStepKey[];
    done: Record<ChecklistStepKey, boolean>;
    completedCount: number;
    totalSteps: number;
    environments: string[];
    refetchOverview: () => void;
}

export const useChecklistContextValue =
    (): FloatingOnboardingChecklistContextValue | null => {
        const visibility = useOnboardingChecklistVisibility();
        const { state, update, markCompleted } =
            useFloatingOnboardingChecklistState();
        const [openRequestCounter, setOpenRequestCounter] = useState(0);
        const { splash } = useAuthSplash();
        const quickTourEnabled = useUiFlag('onboardingIntroTour');
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
        } = useProjectOverview(visibility === 'visible' ? projectId : '');

        const environments = useMemo(
            () => (project.environments ?? []).map((env) => env.environment),
            [project.environments],
        );

        const serverStep = getProjectOnboardingStep(
            project.onboardingStatus,
        ).current;
        const tourSplashSeen = Boolean(
            splash?.[ONBOARDING_INTRO_FINISHED_SPLASH_ID],
        );
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

        if (visibility === 'hidden') return null;
        if (visibility === 'visible' && (projectError || loading)) return null;

        return {
            state,
            update,
            markCompleted,
            open: () => {
                update({ dismissed: false, minimized: false });
                if (!dismissed) {
                    setOpenRequestCounter((n) => n + 1);
                }
            },
            openRequestCounter,
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
