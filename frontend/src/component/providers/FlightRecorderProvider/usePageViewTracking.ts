import { useEffect, useEffectEvent, useRef } from 'react';
import { useLocation } from 'react-router';
import type { FlightRecorder } from '@unleash/sdk-flight-recorder';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { createUuid } from 'utils/createUuid';
import {
    type EngagedTimeTracker,
    startEngagedTimeTracker,
} from './engagedTime';

// Full path is stored as-is; collapsing ids into templates (/projects/:projectId) is
// done downstream at query time, so it stays editable without a frontend deploy.
export const usePageViewTracking = (recorder: FlightRecorder | null): void => {
    const { pathname } = useLocation();
    const { uiConfig } = useUiConfig();

    const context = uiConfig?.unleashContext;
    const previousPathRef = useRef<string | null>(null);
    const currentPageRef = useRef<{
        pageviewId: string;
        tracker: EngagedTimeTracker;
    } | null>(null);

    // Boolean gate, not the context object
    const contextReady = context !== undefined;

    // recorder passed in, not read latest, so teardown flushes the leave into the
    // instance being closed even after the latest recorder is null.
    const emitPageLeave = useEffectEvent((recorder: FlightRecorder) => {
        const page = currentPageRef.current;
        if (!page) {
            return;
        }
        recorder.record({
            eventType: 'custom',
            eventName: 'pageleave',
            context: { ...context },
            payload: {
                pageviewId: page.pageviewId,
                engagedMs: page.tracker.engagedMs(),
            },
        });
        page.tracker.stop();
        currentPageRef.current = null;
    });

    const emitPageView = useEffectEvent((path: string) => {
        // pageshow path bypasses the navigation effect's identity gate, so re-check here.
        if (!recorder || !contextReady) {
            return;
        }
        // Close any still-open page first; the pageshow path has no preceding pageleave.
        emitPageLeave(recorder);
        const referrer = previousPathRef.current ?? document.referrer;
        previousPathRef.current = path;

        const pageviewId = createUuid();
        recorder.record({
            eventType: 'custom',
            eventName: 'pageview',
            context: { ...context },
            payload: {
                pageviewId,
                path,
                referrer,
            },
        });
        currentPageRef.current = {
            pageviewId,
            tracker: startEngagedTimeTracker(),
        };
    });

    useEffect(() => {
        if (!recorder || !contextReady) {
            return;
        }
        emitPageView(pathname);
    }, [recorder, contextReady, pathname]);

    // Captured recorder lands the closing leave in the instance being torn down.
    useEffect(() => {
        if (!recorder) {
            return;
        }
        const leaveAndFlush = () => {
            emitPageLeave(recorder);
            void recorder.flush({ keepalive: true });
        };
        // bfcache restore fires no SPA navigation, so open a fresh view here.
        const onPageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                emitPageView(window.location.pathname);
            }
        };
        window.addEventListener('pagehide', leaveAndFlush);
        window.addEventListener('pageshow', onPageShow);
        return () => {
            window.removeEventListener('pagehide', leaveAndFlush);
            window.removeEventListener('pageshow', onPageShow);
            leaveAndFlush();
        };
    }, [recorder]);
};
