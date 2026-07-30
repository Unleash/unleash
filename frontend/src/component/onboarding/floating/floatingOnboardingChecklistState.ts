import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';

/** Which of the guided steps the user has completed (locally captured). */
export interface FloatingOnboardingChecklistCompleted {
    tour?: boolean;
    flag?: boolean;
    sdk?: boolean;
    on?: boolean;
}

export interface FloatingOnboardingChecklistState {
    /** Closed for good (until localStorage is cleared). */
    dismissed: boolean;
    /** Collapsed to just the header bar. */
    minimized: boolean;
    /** The project the checklist is targeting (auto-adopted from the user's projects). */
    projectId?: string;
    completed: FloatingOnboardingChecklistCompleted;
}

const DEFAULT_STATE: FloatingOnboardingChecklistState = {
    dismissed: false,
    minimized: false,
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

    return { state, update, markCompleted };
};
