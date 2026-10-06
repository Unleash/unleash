import type React from 'react';
import { type FC, useContext, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';
import { createUuid } from 'utils/createUuid';
import { normalizePath } from 'utils/normalizePath';
import { FlightRecorderContext } from 'contexts/FlightRecorderContext';
import {
    EventTrackerContext,
    type EventTracker,
} from 'contexts/EventTrackerContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const EventTrackerProvider: FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const flightRecorder = useContext(FlightRecorderContext);
    const { uiConfig } = useUiConfig();
    const { pathname } = useLocation();

    const flightRecorderRef = useRef(flightRecorder);
    flightRecorderRef.current = flightRecorder;
    const unleashContextRef = useRef(uiConfig?.unleashContext);
    unleashContextRef.current = uiConfig?.unleashContext;
    const pathRef = useRef(pathname);
    pathRef.current = pathname;

    const tracker = useMemo<EventTracker>(
        () => ({
            trackEvent: (eventName, options) => {
                flightRecorderRef.current?.record({
                    eventType: 'custom',
                    eventName,
                    context: { ...unleashContextRef.current },
                    payload: {
                        ...options?.props,
                        path: normalizePath(pathRef.current),
                        // Unique per call: repeated user actions must not fold into
                        // one row via SDK dedupe; impressions still dedupe.
                        eventId: createUuid(),
                    },
                });
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
