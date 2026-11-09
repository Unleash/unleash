import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSessionKeepAlive } from './useSessionKeepAlive.js';

const uiConfig = vi.hoisted(() => ({
    value: {} as Record<string, unknown>,
}));

vi.mock('hooks/api/getters/useUiConfig/useUiConfig', () => ({
    default: () => ({ uiConfig: uiConfig.value }),
}));

const setVisibility = (state: 'visible' | 'hidden') => {
    Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => state,
    });
};

/**
 * The ping is the only thing that renews a session, so it has to fire when a
 * person is there and stay quiet when one is not. These are the cases that
 * decide whether the idle timeout means anything.
 */
describe('useSessionKeepAlive', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.useFakeTimers();
        fetchMock = vi.fn().mockResolvedValue({ status: 204 });
        vi.stubGlobal('fetch', fetchMock);
        setVisibility('visible');
        uiConfig.value = { sessionKeepAliveIntervalSeconds: 60 };
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('sends nothing when the server asks for no pings', () => {
        uiConfig.value = { sessionKeepAliveIntervalSeconds: 0 };
        const addListener = vi.spyOn(document, 'addEventListener');

        renderHook(() => useSessionKeepAlive(true));
        document.dispatchEvent(new Event('pointerdown'));

        expect(fetchMock).not.toHaveBeenCalled();
        expect(
            addListener.mock.calls.filter(([event]) => event === 'pointerdown'),
        ).toHaveLength(0);
        addListener.mockRestore();
    });

    it('sends one ping on the first input, and not again within the interval', () => {
        renderHook(() => useSessionKeepAlive(true));

        document.dispatchEvent(new Event('pointerdown'));
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('api/admin/session/keep-alive'),
            { method: 'POST', credentials: 'include' },
        );

        vi.advanceTimersByTime(30_000);
        document.dispatchEvent(new Event('keydown'));
        expect(fetchMock).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(31_000);
        document.dispatchEvent(new Event('keydown'));
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('counts activity a dialog stops from bubbling', () => {
        // menus and dialogs call stopPropagation, which is why the listeners sit
        // on the capture phase instead of waiting for the event to reach us
        const dialog = document.createElement('div');
        document.body.appendChild(dialog);
        dialog.addEventListener('wheel', (event) => event.stopPropagation());
        renderHook(() => useSessionKeepAlive(true));

        dialog.dispatchEvent(new Event('wheel', { bubbles: true }));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        dialog.remove();
    });

    it('ignores scroll: a page that scrolls itself is not a person', () => {
        // a scroll the page caused itself looks exactly like a human one, so
        // counting it would renew the session of a tab nobody is sitting at
        renderHook(() => useSessionKeepAlive(true));

        document.dispatchEvent(new Event('scroll'));

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('lets the next input retry a failed ping, but not every keystroke', async () => {
        fetchMock.mockRejectedValue(new Error('offline'));
        renderHook(() => useSessionKeepAlive(true));

        document.dispatchEvent(new Event('pointerdown'));
        await vi.advanceTimersByTimeAsync(1);

        document.dispatchEvent(new Event('keydown'));
        expect(fetchMock).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(6_000);
        document.dispatchEvent(new Event('keydown'));
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('retries a failed ping even when the interval is shorter than the backoff', async () => {
        // a fractional-minute idle window puts the interval below
        // RETRY_AFTER_MS. Unclamped, the back-off lands in the future and the
        // throttle never opens again, so the tab stops reporting for good.
        uiConfig.value = { sessionKeepAliveIntervalSeconds: 4 };
        fetchMock.mockRejectedValue(new Error('offline'));
        renderHook(() => useSessionKeepAlive(true));

        document.dispatchEvent(new Event('pointerdown'));
        await vi.advanceTimersByTimeAsync(1);
        expect(fetchMock).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(4_100);
        document.dispatchEvent(new Event('keydown'));

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('stays quiet in a tab nobody is looking at', () => {
        setVisibility('hidden');
        renderHook(() => useSessionKeepAlive(true));

        document.dispatchEvent(new Event('wheel'));
        vi.advanceTimersByTime(600_000);
        document.dispatchEvent(new Event('wheel'));

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does not latch itself off after a rejected ping', async () => {
        // the hook never reads the response, so this guards against re-adding a
        // `signedOut` latch: that would stop a tab whose user has since signed
        // in elsewhere from ever renewing again. Redirecting is the UI poll's
        // job, not this hook's.
        fetchMock.mockResolvedValue({ status: 401 });
        renderHook(() => useSessionKeepAlive(true));

        document.dispatchEvent(new Event('pointerdown'));
        expect(fetchMock).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(61_000);
        document.dispatchEvent(new Event('pointerdown'));

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('counts the window coming forward as activity', () => {
        // somebody who switches back and reads without touching anything is
        // still there, and this is the only event that says so. It is on
        // `window`: a document-level listener would hear inputs taking focus.
        renderHook(() => useSessionKeepAlive(true));

        window.dispatchEvent(new Event('focus'));

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('starts fresh when the user signs in again', () => {
        const { rerender } = renderHook(
            ({ loggedIn }) => useSessionKeepAlive(loggedIn),
            { initialProps: { loggedIn: true } },
        );

        document.dispatchEvent(new Event('pointerdown'));
        expect(fetchMock).toHaveBeenCalledTimes(1);

        rerender({ loggedIn: false });
        rerender({ loggedIn: true });
        document.dispatchEvent(new Event('pointerdown'));

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('stops listening when it unmounts', () => {
        const { unmount } = renderHook(() => useSessionKeepAlive(true));

        unmount();
        document.dispatchEvent(new Event('pointerdown'));

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('sends nothing for a signed-out user', () => {
        renderHook(() => useSessionKeepAlive(false));
        document.dispatchEvent(new Event('pointerdown'));
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
