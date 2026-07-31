import { useCallback, useRef } from 'react';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';

/** Which of the guided steps the user has completed (locally captured). */
export interface FloatingOnboardingChecklistCompleted {
    tour?: boolean;
    flag?: boolean;
    sdk?: boolean;
    on?: boolean;
}

export type PendingAction = { type: 'flag' | 'sdk'; setAt: number };

export const PENDING_ACTION_TTL_MS = 60_000;

export const isPendingActionExpired = (
    action: PendingAction | undefined,
    nowMs: number,
): boolean =>
    action !== undefined && nowMs - action.setAt > PENDING_ACTION_TTL_MS;

export interface FloatingOnboardingChecklistState {
    /**
     * Local override for the server-persisted "previously dismissed" splash.
     * `undefined` = no local preference (fall back to splash); `true` = user
     * dismissed; `false` = user re-opened via header menu (overrides splash
     * for as long as localStorage sticks around).
     */
    dismissed?: boolean;
    /** Collapsed to just the header bar. */
    minimized: boolean;
    /**
     * Dialog to open once we've navigated to a route where it can render
     * safely (e.g. `CreateFeatureDialog` needs `:projectId` in the URL).
     * Persisted so it survives MainLayout re-mount on route change; the
     * `setAt` timestamp guards against a stale value opening a dialog on
     * an unrelated visit days later (see PENDING_ACTION_TTL_MS).
     */
    pendingAction?: PendingAction;
    completed: FloatingOnboardingChecklistCompleted;
}

const DEFAULT_STATE: FloatingOnboardingChecklistState = {
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

    // `useLocalStorageState` returns a fresh setter each render, so route
    // it through a ref to give consumers stable `update`/`markCompleted`
    // identities — safe to list in useEffect deps without re-firing.
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
