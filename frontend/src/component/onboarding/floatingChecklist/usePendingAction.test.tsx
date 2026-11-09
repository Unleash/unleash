import { beforeEach, expect, test, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { createLocalStorage } from 'utils/createLocalStorage.ts';
import {
    PENDING_ACTION_TTL_MS,
    type PendingAction,
    STORAGE_KEY,
    usePendingAction,
} from './usePendingAction.ts';

const navigate = vi.fn();

vi.mock('react-router', async () => {
    const actual =
        await vi.importActual<typeof import('react-router')>('react-router');
    return { ...actual, useNavigate: () => navigate };
});

const seed = (pending: PendingAction) =>
    createLocalStorage<{ action?: PendingAction }>(STORAGE_KEY, {}).setValue({
        action: pending,
    });

type ActionEntry = { atPage: boolean; page: string; action: () => void };

const makeActions = (
    overrides: Partial<{
        flag: Partial<ActionEntry>;
        sdk: Partial<ActionEntry>;
    }> = {},
) => ({
    flag: {
        atPage: false,
        page: '/projects/default',
        action: vi.fn(),
        ...overrides.flag,
    } satisfies ActionEntry,
    sdk: {
        atPage: false,
        page: '/projects/default/features/first',
        action: vi.fn(),
        ...overrides.sdk,
    } satisfies ActionEntry,
});

beforeEach(() => {
    localStorage.clear();
    navigate.mockClear();
});

test('does nothing when nothing is queued', () => {
    const actions = makeActions();

    renderHook(() => usePendingAction({ actions }));

    expect(actions.flag.action).not.toHaveBeenCalled();
    expect(actions.sdk.action).not.toHaveBeenCalled();
});

test('drops an expired queued action without running it', () => {
    seed({ type: 'flag', setAt: Date.now() - PENDING_ACTION_TTL_MS - 1 });
    const actions = makeActions({ flag: { atPage: true } });

    renderHook(() => usePendingAction({ actions }));

    expect(actions.flag.action).not.toHaveBeenCalled();
});

test('runs the matching action once the user lands on its page', () => {
    seed({ type: 'flag', setAt: Date.now() });
    const actions = makeActions();

    const { rerender } = renderHook(
        (props: { actions: typeof actions }) => usePendingAction(props),
        { initialProps: { actions } },
    );

    expect(actions.flag.action).not.toHaveBeenCalled();

    rerender({
        actions: { ...actions, flag: { ...actions.flag, atPage: true } },
    });

    expect(actions.flag.action).toHaveBeenCalledTimes(1);
});

test('runs only the action matching the queued type', () => {
    seed({ type: 'sdk', setAt: Date.now() });
    const actions = makeActions({
        flag: { atPage: true },
        sdk: { atPage: true },
    });

    renderHook(() => usePendingAction({ actions }));

    expect(actions.sdk.action).toHaveBeenCalledTimes(1);
    expect(actions.flag.action).not.toHaveBeenCalled();
});

test('runOnPage runs the action immediately when the user is already on its page', () => {
    const actions = makeActions({ flag: { atPage: true } });

    const { result } = renderHook(() => usePendingAction({ actions }));

    act(() => result.current.runOnPage('flag'));

    expect(actions.flag.action).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
});

test('runOnPage navigates to the action page when the user is elsewhere and fires on arrival', () => {
    const actions = makeActions({ flag: { page: '/projects/marketing' } });

    const { rerender, result } = renderHook(
        (props: { actions: typeof actions }) => usePendingAction(props),
        { initialProps: { actions } },
    );

    act(() => result.current.runOnPage('flag'));

    expect(navigate).toHaveBeenCalledWith('/projects/marketing');
    expect(actions.flag.action).not.toHaveBeenCalled();

    rerender({
        actions: { ...actions, flag: { ...actions.flag, atPage: true } },
    });

    expect(actions.flag.action).toHaveBeenCalledTimes(1);
});

test('cancelPendingAction prevents a queued action from firing once the user reaches its page', () => {
    seed({ type: 'flag', setAt: Date.now() });
    const actions = makeActions();

    const { rerender, result } = renderHook(
        (props: { actions: typeof actions }) => usePendingAction(props),
        { initialProps: { actions } },
    );

    act(() => result.current.cancelPendingAction());

    rerender({
        actions: { ...actions, flag: { ...actions.flag, atPage: true } },
    });

    expect(actions.flag.action).not.toHaveBeenCalled();
});
