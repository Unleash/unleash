import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';

export type FloatingOnboardingChecklistView = 'list' | 'guide';

/** Which of the guided steps the user has completed (locally captured). */
export interface FloatingOnboardingChecklistCompleted {
    project?: boolean;
    flag?: boolean;
    sdk?: boolean;
    on?: boolean;
}

export interface FloatingOnboardingChecklistState {
    /** Closed for good (until localStorage is cleared). */
    dismissed: boolean;
    /** Collapsed to just the header bar. */
    minimized: boolean;
    view: FloatingOnboardingChecklistView;
    /** The project the user is setting up via the guide. */
    projectId?: string;
    completed: FloatingOnboardingChecklistCompleted;
}

const DEFAULT_STATE: FloatingOnboardingChecklistState = {
    dismissed: false,
    minimized: false,
    view: 'list',
    completed: {},
};

/**
 * Persisted state for the floating "Get started" helper. It survives route
 * changes and reloads so the helper can follow the user around Unleash.
 */
export const useFloatingOnboardingChecklistState = () => {
    const [state, setState] =
        useLocalStorageState<FloatingOnboardingChecklistState>(
            'floating-onboarding:v1',
            DEFAULT_STATE,
        );

    const update = (patch: Partial<FloatingOnboardingChecklistState>) =>
        setState((prev) => ({ ...prev, ...patch }));

    const markCompleted = (step: keyof FloatingOnboardingChecklistCompleted) =>
        setState((prev) => ({
            ...prev,
            completed: { ...prev.completed, [step]: true },
        }));

    /** Reset back to a fresh first-run state — handy for demoing the flow. */
    const reset = () => setState(DEFAULT_STATE);

    return { state, update, markCompleted, reset };
};
