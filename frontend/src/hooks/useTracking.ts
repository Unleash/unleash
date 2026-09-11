import { useMemo, useRef } from 'react';
import { useEventTracker } from 'hooks/useEventTracker';
import type {
    TrackingAction,
    TrackingProps,
    Tracking,
} from 'utils/trackingEvents';
import { requestFailureProps } from 'utils/requestFailureProps';

type TrackEvent = ReturnType<typeof useEventTracker>['trackEvent'];

// Callable so a call site holds one named function per journey and nothing to destructure.
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
                ...(tracking.type ? { eventType: tracking.type } : {}),
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
        // Counts as an attempt too, so submitted and failed both get a row.
        validationFailed: (props?: TrackingProps) => {
            track('submitted', props);
            track('failed', { ...props, failedOn: 'validation' });
        },
    });
};

// The declaration is read through a ref at call time, so the returned function stays stable
// across renders and is safe in effect dependency lists. Without a declaration every call is a no-op.
export const useTracking = (tracking: Tracking | undefined): Tracker => {
    const { trackEvent } = useEventTracker();
    const trackingRef = useRef(tracking);
    trackingRef.current = tracking;

    return useMemo(
        () => createTracker(trackEvent, () => trackingRef.current),
        [trackEvent],
    );
};
