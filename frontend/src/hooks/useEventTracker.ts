import { useCallback, useContext, useRef } from 'react';
import { EventTrackerContext } from 'contexts/EventTrackerContext';
import type { TrackEventOptions } from 'contexts/EventTrackerContext';
import type { CustomEvents } from 'utils/trackingEvents';

export const useEventTracker = () => {
    const tracker = useContext(EventTrackerContext);
    const trackerRef = useRef(tracker);
    trackerRef.current = tracker;

    const trackEvent = useCallback(
        (event: CustomEvents, options?: TrackEventOptions) => {
            trackerRef.current?.trackEvent(event, options);
        },
        [],
    );

    return { trackEvent };
};
