import { useEventTracker } from 'hooks/useEventTracker';
import {
    emitTrackingAction,
    type TrackingAction,
    type TrackingProps,
    type Tracking,
    runTrackedMutation,
} from 'utils/trackingEvents';

export const useTracking = (tracking: Tracking | undefined) => {
    const { trackEvent } = useEventTracker();

    const track = (action: TrackingAction, props?: TrackingProps) => {
        if (!tracking) {
            return;
        }
        emitTrackingAction(trackEvent, tracking, action, props);
    };

    const trackMutation = async <T>(
        fn: () => Promise<T>,
        props?: TrackingProps,
    ): Promise<T> => {
        if (!tracking) {
            return fn();
        }
        return runTrackedMutation(trackEvent, tracking, fn, props);
    };

    // A validation failure is still an attempt, so it lands in the same denominator.
    const trackValidationFailed = (props?: TrackingProps) => {
        track('submitted', props);
        track('failed', { ...props, failedOn: 'validation' });
    };

    return { track, trackMutation, trackValidationFailed };
};
