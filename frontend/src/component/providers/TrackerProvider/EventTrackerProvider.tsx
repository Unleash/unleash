import type React from 'react';
import { type FC, useContext, useMemo, useRef } from 'react';
import { PlausibleContext } from 'contexts/PlausibleContext';
import { FlightRecorderContext } from 'contexts/FlightRecorderContext';
import {
    EventTrackerContext,
    type EventTracker,
} from 'contexts/EventTrackerContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const EventTrackerProvider: FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const plausible = useContext(PlausibleContext);
    const flightRecorder = useContext(FlightRecorderContext);
    const { uiConfig } = useUiConfig();

    const plausibleRef = useRef(plausible);
    plausibleRef.current = plausible;
    const flightRecorderRef = useRef(flightRecorder);
    flightRecorderRef.current = flightRecorder;
    const unleashContextRef = useRef(uiConfig?.unleashContext);
    unleashContextRef.current = uiConfig?.unleashContext;

    const tracker = useMemo<EventTracker>(
        () => ({
            trackEvent: (eventName, options) => {
                plausibleRef.current?.trackEvent(eventName, options);
                flightRecorderRef.current?.record({
                    eventType: 'custom',
                    eventName,
                    context: { ...unleashContextRef.current },
                    payload: options?.props,
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
