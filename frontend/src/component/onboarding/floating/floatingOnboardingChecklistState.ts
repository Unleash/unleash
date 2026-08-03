import { useCallback, useRef } from 'react';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';

// Only `tour` and `flag` have a reliable client-side completion event.
export interface FloatingOnboardingChecklistCompleted {
    tour?: boolean;
    flag?: boolean;
}

export type PendingAction = { type: 'flag' | 'sdk'; setAt: number };

export const PENDING_ACTION_TTL_MS = 60_000;

export const isPendingActionExpired = (
    action: PendingAction,
    nowMs: number,
): boolean => nowMs - action.setAt > PENDING_ACTION_TTL_MS;

export interface FloatingOnboardingChecklistState {
    // `undefined` = fall back to server splash; `true`/`false` overrides it.
    dismissed?: boolean;
    minimized: boolean;
    // Dialog queued to open once we land on a route where it can render.
    pendingAction?: PendingAction;
    completed: FloatingOnboardingChecklistCompleted;
}

const DEFAULT_STATE: FloatingOnboardingChecklistState = {
    minimized: false,
    completed: {},
};

export const useFloatingOnboardingChecklistState = () => {
    const [state, setState] =
        useLocalStorageState<FloatingOnboardingChecklistState>(
            'floating-onboarding:v1',
            DEFAULT_STATE,
        );

    // `useLocalStorageState` returns a fresh setter each render; route
    // through a ref so `update`/`markCompleted` stay referentially stable.
    const setStateRef = useRef(setState);
    setStateRef.current = setState;

    const update = useCallback(
        (patch: Partial<FloatingOnboardingChecklistState>) =>
            setStateRef.current((prev) => ({ ...prev, ...patch })),
        [],
    );

    const markCompleted = useCallback(
        (step: keyof FloatingOnboardingChecklistCompleted) =>
            setStateRef.current((prev) => ({
                ...prev,
                completed: { ...prev.completed, [step]: true },
            })),
        [],
    );

    return { state, update, markCompleted };
};
