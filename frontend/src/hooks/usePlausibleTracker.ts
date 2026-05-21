import { useCallback, useContext, useRef } from 'react';
import { PlausibleContext } from 'contexts/PlausibleContext';
import type { CustomEvents } from 'utils/trackingEvents';
import type { TrackEventOptions } from 'contexts/EventTrackerContext';
export type { CustomEvents } from 'utils/trackingEvents';

export const usePlausibleTracker = () => {
    const plausible = useContext(PlausibleContext);
    const plausibleRef = useRef(plausible);
    plausibleRef.current = plausible;

    const trackEvent = useCallback(
        (eventName: CustomEvents, options?: TrackEventOptions) => {
            plausibleRef.current?.trackEvent(eventName, options);
        },
        [],
    );

    return { trackEvent };
};
