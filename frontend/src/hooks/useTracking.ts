import { useMemo, useRef } from 'react';
import { useEventTracker } from 'hooks/useEventTracker';
import type {
    TrackingAction,
    TrackingProps,
    Tracking,
} from 'utils/trackingEvents';
import { requestFailureProps } from 'utils/requestFailureProps';

type TrackEvent = ReturnType<typeof useEventTracker>['trackEvent'];

type Tracker = {
    track: (action: TrackingAction, props?: TrackingProps) => void;
    trackMutation: <T>(
        fn: () => Promise<T>,
        props?: TrackingProps,
    ) => Promise<T>;
    trackValidationFailed: (props?: TrackingProps) => void;
};

const createTracker = (
    trackEvent: TrackEvent,
    getTracking: () => Tracking | undefined,
): Tracker => {
    const track: Tracker['track'] = (action, props) => {
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

    return {
        track,
        // Rethrows so the caller still handles toasts and errors.
        trackMutation: async (fn, props) => {
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
        trackValidationFailed: (props) => {
            track('submitted', props);
            track('failed', { ...props, failedOn: 'validation' });
        },
    };
};

// The declaration is read through a ref at call time, so the returned functions stay stable
// across renders and are safe in effect dependency lists. Without a declaration every call is a no-op.
export const useTracking = (tracking: Tracking | undefined): Tracker => {
    const { trackEvent } = useEventTracker();
    const trackingRef = useRef(tracking);
    trackingRef.current = tracking;

    return useMemo(
        () => createTracker(trackEvent, () => trackingRef.current),
        [trackEvent],
    );
};
