import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import type { FlightRecorder } from '@unleash/sdk-flight-recorder';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { createUuid } from 'utils/createUuid';
import { resolvePageView } from './resolvePageView';

// Records a `$pageview` custom event on every route change. The `$` prefix is
// reserved for instrumentation events so they never collide with product custom
// events. See the Page View Tracking design.
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

    // Read patterns through a ref so they aren't an effect dep: a caller passing
    // an inline array changes its identity each render, which would refire the
    // effect and record a pageview on every render. Only navigation should record.
    const routePatternsRef = useRef(routePatterns);
    routePatternsRef.current = routePatterns;

    // Boolean gate, not the context object: hold the first view until identity
    // loads (no userId-less landing), but don't refire when SWR revalidates.
    const contextReady = context !== undefined;

    useEffect(() => {
        if (!recorder || !contextReady) {
            return;
        }

        const resolved = resolvePageView(routePatternsRef.current, pathname);

        // Skip unmatched routes (e.g. redirects through /) so they neither
        // record nor pollute the referrer chain.
        if (!resolved.matched) {
            return;
        }
        const { path, params } = resolved;

        const referrer = previousPathRef.current ?? document.referrer;
        previousPathRef.current = path;

        recorder.record({
            eventType: 'custom',
            eventName: '$pageview',
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
