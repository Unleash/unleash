import { useMemo, useRef } from 'react';
import { useEventTracker } from 'hooks/useEventTracker';
import type {
    TrackingAction,
    TrackingProps,
    Tracking,
} from 'utils/trackingEvents';
import { requestFailureProps } from 'utils/requestFailureProps';

type TrackEvent = ReturnType<typeof useEventTracker>['trackEvent'];

/**
 * Callable, so a call site holds one named function per journey and you don't have to destructure
 */
export type Tracker = ((
    action: TrackingAction,
    props?: TrackingProps,
) => void) & {
    mutation: <T>(fn: () => Promise<T>, props?: TrackingProps) => Promise<T>;
    validationFailed: (props?: TrackingProps) => void;
};

const createTracker = (
    trackEvent: TrackEvent,
    getTracking: () => Tracking | undefined,
): Tracker => {
    const track = (action: TrackingAction, props?: TrackingProps) => {
        const tracking = getTracking();
        if (!tracking) {
            return;
        }
        trackEvent(tracking.event, {
            props: {
                ...tracking.props,
                ...props,
                eventType: tracking.type,
                action,
            },
        });
    };

    return Object.assign(track, {
        // Rethrows so the caller still handles toasts and errors.
        mutation: async <T>(fn: () => Promise<T>, props?: TrackingProps) => {
            track('submitted', props);
            try {
                const result = await fn();
                track('succeeded', props);
                return result;
            } catch (error: unknown) {
                track('failed', { ...props, ...requestFailureProps(error) });
                throw error;
            }
        },
        // Counts as an attempt too, so submitted and failed are both sent.
        validationFailed: (props?: TrackingProps) => {
            track('submitted', props);
            track('failed', { ...props, failedOn: 'validation' });
        },
    });
};

/**
 * The only way a journey is sent; nothing should call `trackEvent` or `useEventTracker` directly.
 *
 * Call the tracker from the handler for whatever the user did: a click, a key press, a form
 * submit. Call it before navigate() if you are navigating. Avoid calling it from an effect: an
 * effect re-runs on every dependency change and may send the event twice. Two events are the
 * exception because no handler produces them: a dialog sends opened from an effect on its open
 * prop, and a search box sends succeeded from an effect on the settled query.
 *
 * The declaration is read through a ref at call time, so the returned function stays stable
 * across renders and is safe in effect dependency lists.
 *
 * The declaration may be undefined. Shared components like Dialogue and SidebarModal take
 * tracking as an optional prop, and many callers do not pass one currently. The tracker they get back
 * still works, it just sends nothing, so they can call it without checking first.
 */
export const useTracking = (tracking: Tracking | undefined): Tracker => {
    const { trackEvent } = useEventTracker();
    const trackingRef = useRef(tracking);
    trackingRef.current = tracking;

    return useMemo(
        () => createTracker(trackEvent, () => trackingRef.current),
        [trackEvent],
    );
};
