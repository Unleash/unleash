import type React from 'react';
import { type FC, useContext, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';
import { createUuid } from 'utils/createUuid';
import { normalizePath } from 'utils/normalizePath';
import { PlausibleContext } from 'contexts/PlausibleContext';
import { FlightRecorderContext } from 'contexts/FlightRecorderContext';
import {
    EventTrackerContext,
    type EventTracker,
    type ScalarProps,
    type TrackEventOptions,
} from 'contexts/EventTrackerContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

// Plausible takes flat key-value pairs only; anything nested goes to the flight
// recorder alone rather than being stringified into something unqueryable.
const scalarsOnly = (props: TrackEventOptions['props']): ScalarProps =>
    Object.fromEntries(
        Object.entries(props ?? {}).filter(
            ([, value]) =>
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean',
        ),
    ) as ScalarProps;

export const EventTrackerProvider: FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const plausible = useContext(PlausibleContext);
    const flightRecorder = useContext(FlightRecorderContext);
    const { uiConfig } = useUiConfig();
    const { pathname } = useLocation();

    const plausibleRef = useRef(plausible);
    plausibleRef.current = plausible;
    const flightRecorderRef = useRef(flightRecorder);
    flightRecorderRef.current = flightRecorder;
    const unleashContextRef = useRef(uiConfig?.unleashContext);
    unleashContextRef.current = uiConfig?.unleashContext;
    const pathRef = useRef(pathname);
    pathRef.current = pathname;

    const tracker = useMemo<EventTracker>(
        () => ({
            trackEvent: (eventName, options) => {
                plausibleRef.current?.trackEvent(eventName, {
                    ...options,
                    props: scalarsOnly(options?.props),
                });
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
