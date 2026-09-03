import { createContext } from 'react';
import type { CustomEvents, ReservedEventName } from 'utils/trackingEvents';

// What sinks that only accept flat key-value pairs (Plausible, LogRocket) can carry.
export type ScalarProps = Record<string, string | number | boolean>;

// The flight recorder takes arbitrary JSON. Nested values are dropped on the way to
// the scalar-only sinks, which is fine: these events aren't Plausible goals.
type TrackedValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | TrackedValue[]
    | { [key: string]: TrackedValue };

// `path` is reserved: the provider injects the current route so custom events correlate
// with page views on the same screen.
export type EventProps = Record<string, TrackedValue> & {
    path?: never;
};

export type TrackEventOptions = {
    props?: EventProps;
};

// pageview/pageleave are emitted internally by page-view tracking; excluding them here
// makes trackEvent('pageview') a compile error even if someone adds them to CustomEvents.
export type TrackableEvent = Exclude<CustomEvents, ReservedEventName>;

export type EventTracker = {
    trackEvent: (event: TrackableEvent, options?: TrackEventOptions) => void;
};

export const EventTrackerContext = createContext<EventTracker | null>(null);
