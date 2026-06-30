import { useEffect, useEffectEvent, useRef } from 'react';
import { useLocation } from 'react-router';
import type { FlightRecorder } from '@unleash/sdk-flight-recorder';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { createUuid } from 'utils/createUuid';

// Records a `pageview` on every navigation, storing the full path as-is. Collapsing ids
// into templates (e.g. /projects/:projectId) is done downstream at query time, so it stays
// editable and reclassifies history without a frontend deploy.
export const usePageViewTracking = (recorder: FlightRecorder | null): void => {
    const { pathname } = useLocation();
    const { uiConfig } = useUiConfig();

    const context = uiConfig?.unleashContext;
    const previousPathRef = useRef<string | null>(null);

    // Gate on a boolean rather than the context object, so SWR revalidation doesn't
    // refire the effect. Holds the first pageview until identity loads, so we never
    // record a landing without a userId.
    const contextReady = context !== undefined;

    // Reads the latest context without making it an effect dependency, so the pageview
    // fires only on navigation rather than on every render.
    const recordPageView = useEffectEvent((path: string) => {
        if (!recorder) {
            return;
        }
        const referrer = previousPathRef.current ?? document.referrer;
        previousPathRef.current = path;

        recorder.record({
            eventType: 'custom',
            eventName: 'pageview',
            context: { ...context },
            payload: {
                pageviewId: createUuid(),
                path,
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
