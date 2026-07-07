import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';

export type FloatingOnboardingView = 'list' | 'guide';

/** Which of the guided steps the user has completed (locally captured). */
export interface FloatingOnboardingCompleted {
    project?: boolean;
    flag?: boolean;
    sdk?: boolean;
    on?: boolean;
}

export interface FloatingOnboardingState {
    /** Closed for good (until localStorage is cleared). */
    dismissed: boolean;
    /** Collapsed to just the header bar. */
    minimized: boolean;
    view: FloatingOnboardingView;
    /** The project the user is setting up via the guide. */
    projectId?: string;
    completed: FloatingOnboardingCompleted;
}

const DEFAULT_STATE: FloatingOnboardingState = {
    dismissed: false,
    minimized: false,
    view: 'list',
    completed: {},
};

/**
 * Persisted state for the floating "Get started" helper. It survives route
 * changes and reloads so the helper can follow the user around Unleash.
 */
export const useFloatingOnboardingState = () => {
    const [state, setState] = useLocalStorageState<FloatingOnboardingState>(
        'floating-onboarding:v1',
        DEFAULT_STATE,
    );

    const update = (patch: Partial<FloatingOnboardingState>) =>
        setState((prev) => ({ ...prev, ...patch }));

    const markCompleted = (step: keyof FloatingOnboardingCompleted) =>
        setState((prev) => ({
            ...prev,
            completed: { ...prev.completed, [step]: true },
        }));

    /** Reset back to a fresh first-run state — handy for demoing the flow. */
    const reset = () => setState(DEFAULT_STATE);

    return { state, update, markCompleted, reset };
};
