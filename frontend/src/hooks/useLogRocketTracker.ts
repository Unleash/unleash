import { useCallback, useContext, useRef } from 'react';
import { LogRocketContext } from 'contexts/LogRocketContext';
import type { CustomEvents } from './usePlausibleTracker';

export const useLogRocketTracker = () => {
    const tracker = useContext(LogRocketContext);
    const trackerRef = useRef(tracker);
    trackerRef.current = tracker;

    const track = useCallback(
        (
            // This couples it to Plausible events for now
            eventName: CustomEvents,
            props?: Record<string, string | number | boolean>,
        ) => {
            try {
                trackerRef.current?.track(eventName, props);
            } catch (error) {
                console.warn(error);
            }
        },
        [],
    );

    return { track };
};
