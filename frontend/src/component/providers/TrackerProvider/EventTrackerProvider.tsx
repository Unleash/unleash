import type React from 'react';
import { type FC, useContext, useMemo, useRef } from 'react';
import { PlausibleContext } from 'contexts/PlausibleContext';
import { LogRocketContext } from 'contexts/LogRocketContext';
import {
    EventTrackerContext,
    type EventTracker,
} from 'contexts/EventTrackerContext';

export const EventTrackerProvider: FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const plausible = useContext(PlausibleContext);
    const logRocket = useContext(LogRocketContext);

    const plausibleRef = useRef(plausible);
    plausibleRef.current = plausible;
    const logRocketRef = useRef(logRocket);
    logRocketRef.current = logRocket;

    const tracker = useMemo<EventTracker>(
        () => ({
            trackEvent: (eventName, options) => {
                plausibleRef.current?.trackEvent(eventName, options);
                logRocketRef.current?.track(eventName, options?.props);
            },
        }),
        [],
    );

    return (
        <EventTrackerContext.Provider value={tracker}>
            {children}
        </EventTrackerContext.Provider>
    );
};
