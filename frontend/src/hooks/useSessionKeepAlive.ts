import { useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const ACTIVITY_EVENTS = [
    'pointerdown',
    'keydown',
    'wheel',
    'touchstart',
] as const;

const RETRY_AFTER_MS = 5_000;

export const useSessionKeepAlive = (isLoggedIn: boolean): void => {
    const { uiConfig } = useUiConfig();
    const intervalMs = (uiConfig.sessionKeepAliveIntervalSeconds ?? 0) * 1000;

    const enabled = isLoggedIn && intervalMs > 0;

    useEffect(() => {
        if (!enabled) return;

        const url = formatApiPath('api/admin/session/keep-alive');
        let lastSentAt = 0;

        const ping = () => {
            lastSentAt = Date.now();
            fetch(url, { method: 'POST', credentials: 'include' }).catch(() => {
                // backdate it so input in RETRY_AFTER_MS gets through, rather
                // than waiting out the whole interval
                lastSentAt =
                    Date.now() - Math.max(0, intervalMs - RETRY_AFTER_MS);
            });
        };

        const onActivity = () => {
            if (document.visibilityState !== 'visible') return;

            // throttle: 1st ping immediately, then at most once per interval
            if (Date.now() - lastSentAt < intervalMs) return;

            ping();
        };

        // capture phase: the input events all bubble, but a menu or dialog that
        // calls stopPropagation would otherwise hide real activity from us
        const options = { capture: true, passive: true } as const;

        for (const event of ACTIVITY_EVENTS) {
            document.addEventListener(event, onActivity, options);
        }

        window.addEventListener('focus', onActivity);

        return () => {
            for (const event of ACTIVITY_EVENTS) {
                document.removeEventListener(event, onActivity, options);
            }
            window.removeEventListener('focus', onActivity);
        };
    }, [enabled, intervalMs]);
};
