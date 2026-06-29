import { createContext } from 'react';
import type { CustomEvents } from 'utils/trackingEvents';

export type TrackEventOptions = {
    props?: Record<string, string | number | boolean>;
};

export type EventTracker = {
    trackEvent: (event: CustomEvents, options?: TrackEventOptions) => void;
};

export const EventTrackerContext = createContext<EventTracker | null>(null);
