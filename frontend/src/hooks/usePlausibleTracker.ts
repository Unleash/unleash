import { useCallback, useContext } from 'react';
import { PlausibleContext } from 'contexts/PlausibleContext';
import { EventOptions, PlausibleOptions } from 'plausible-tracker';

/**
 * Allowed event names. Makes it easy to remove, since TS will complain.
 * Add those to Plausible as Custom event goals.
 * @see https://plausible.io/docs/custom-event-goals#2-create-a-custom-event-goal-in-your-plausible-analytics-account
 * @example `'download | 'invite' | 'signup'`
 **/
type CustomEvents = 'invite';

export const usePlausibleTracker = () => {
    const plausible = useContext(PlausibleContext);

    const trackEvent = useCallback(
        (
            eventName: CustomEvents,
            options?: EventOptions | undefined,
            eventData?: PlausibleOptions | undefined
        ) => {
            if (plausible?.trackEvent) {
                plausible.trackEvent(eventName, options, eventData);
            } else {
                if (options?.callback) {
                    options.callback();
                }
            }
        },
        [plausible]
    );

    return { trackEvent };
};
