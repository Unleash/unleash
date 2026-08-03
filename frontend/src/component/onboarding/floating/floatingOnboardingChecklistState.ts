import { useCallback, useRef } from 'react';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';

// Local bridge ticks — kept until the server signal catches up (`local ||
// server` in the context). Only `tour` and `flag` have a reliable client-side
// completion event; `sdk`/`on` come from `onboardingStatus` only.
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
    // Dialog to open once we land on a route where it can render safely
    // (e.g. `CreateFeatureDialog` needs `:projectId`). `setAt` guards against
    // a stale entry firing a dialog days later — see `PENDING_ACTION_TTL_MS`.
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

    // Route the setter through a ref so `update`/`markCompleted` have stable
    // identities — safe to list in `useEffect` deps without re-firing.
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
