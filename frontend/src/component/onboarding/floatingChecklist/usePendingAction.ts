import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useLocalStorageState } from 'hooks/useLocalStorageState.ts';

export type PendingAction = { type: 'flag' | 'sdk'; setAt: number };

export const PENDING_ACTION_TTL_MS = 60_000;

export const STORAGE_KEY = 'floating-onboarding:pending-action:v1';

interface PendingStorage {
    action?: PendingAction;
}

interface ActionConfig {
    atPage: boolean;
    page: string;
    action: () => void;
}

interface UsePendingActionOptions {
    actions: Record<PendingAction['type'], ActionConfig>;
}

const isExpired = (action: PendingAction, nowMs: number) =>
    nowMs - action.setAt > PENDING_ACTION_TTL_MS;

export const usePendingAction = ({ actions }: UsePendingActionOptions) => {
    const [storage, setStorage] = useLocalStorageState<PendingStorage>(
        STORAGE_KEY,
        {},
    );
    const pending = storage.action;
    const navigate = useNavigate();

    // Refs so the effect doesn't need callers to memoize `actions`, and so
    // `setStorage` / `navigate` (fresh each render) don't force re-runs.
    const actionsRef = useRef(actions);
    actionsRef.current = actions;
    const setStorageRef = useRef(setStorage);
    setStorageRef.current = setStorage;
    const navigateRef = useRef(navigate);
    navigateRef.current = navigate;

    const atCurrentPage = pending ? actions[pending.type].atPage : false;

    useEffect(() => {
        if (!pending) return;
        if (isExpired(pending, Date.now())) {
            setStorageRef.current({});
            return;
        }
        if (!atCurrentPage) return;
        actionsRef.current[pending.type].action();
        setStorageRef.current({});
    }, [pending, atCurrentPage]);

    const runOnPage = useCallback((type: PendingAction['type']) => {
        const entry = actionsRef.current[type];
        if (entry.atPage) {
            entry.action();
            return;
        }
        // Queue before navigating so the storage write lands before any
        // navigation-triggered unmount.
        setStorageRef.current({ action: { type, setAt: Date.now() } });
        navigateRef.current(entry.page);
    }, []);

    const cancelPendingAction = useCallback(() => {
        setStorageRef.current({});
    }, []);

    return { runOnPage, cancelPendingAction };
};
