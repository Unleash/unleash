import { useEffect, useEffectEvent, useRef } from 'react';
import { useLocation } from 'react-router';
import type { FlightRecorder } from '@unleash/sdk-flight-recorder';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { createUuid } from 'utils/createUuid';
import { resolvePageView } from './resolvePageView';

// Records a `pageview` custom event on every route change.
export const usePageViewTracking = (
    recorder: FlightRecorder | null,
    routePatterns: { path: string }[],
): void => {
    const { pathname } = useLocation();
    const { uiConfig } = useUiConfig();

    const context = uiConfig?.unleashContext;
    const previousPathRef = useRef<string | null>(null);

    // Gate on a boolean rather than the context object, so SWR revalidation doesn't
    // refire the effect. This holds the first pageview until identity loads, so we
    // never record a landing without a userId.
    const contextReady = context !== undefined;

    // Reads the latest context/routePatterns without making them effect dependencies,
    // so the pageview fires only on navigation rather than on every render.
    const recordPageView = useEffectEvent((currentPath: string) => {
        const resolved = resolvePageView(routePatterns, currentPath);

        // Skip unmatched routes, such as redirects through "/", since they would
        // pollute the referrer chain.
        if (!recorder || !resolved.matched) {
            return;
        }
        const { path, params } = resolved;

        const referrer = previousPathRef.current ?? document.referrer;
        previousPathRef.current = path;

        recorder.record({
            eventType: 'custom',
            eventName: 'pageview',
            context: { ...context },
            payload: {
                pageviewId: createUuid(),
                path,
                params,
                referrer,
            },
        });
    });

    useEffect(() => {
        if (!recorder || !contextReady) {
            return;
        }
        recordPageView(pathname);
    }, [recorder, contextReady, pathname]);
};
