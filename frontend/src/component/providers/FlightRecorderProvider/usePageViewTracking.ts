import { useEffect, useRef } from 'react';
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
    const contextRef = useRef(context);
    contextRef.current = context;
    const previousPathRef = useRef<string | null>(null);

    // Kept in a ref rather than an effect dependency: an inline array changes identity
    // on every render, which would refire the effect and record a pageview each render
    // instead of only on navigation.
    const routePatternsRef = useRef(routePatterns);
    routePatternsRef.current = routePatterns;

    // Gate on a boolean rather than the context object, so SWR revalidation doesn't
    // refire the effect. This holds the first pageview until identity loads, so we
    // never record a landing without a userId.
    const contextReady = context !== undefined;

    useEffect(() => {
        if (!recorder || !contextReady) {
            return;
        }

        const resolved = resolvePageView(routePatternsRef.current, pathname);

        // Skip unmatched routes, such as redirects through "/", since they would
        // pollute the referrer chain.
        if (!resolved.matched) {
            return;
        }
        const { path, params } = resolved;

        const referrer = previousPathRef.current ?? document.referrer;
        previousPathRef.current = path;

        recorder.record({
            eventType: 'custom',
            eventName: 'pageview',
            context: { ...contextRef.current },
            payload: {
                pageviewId: createUuid(),
                path,
                params,
                referrer,
            },
        });
    }, [recorder, contextReady, pathname]);
};
