import { useCallback, useContext, useEffect } from 'react';
import { PlausibleContext } from 'contexts/PlausibleContext';
import { EventOptions, PlausibleOptions } from 'plausible-tracker';

export const usePlausibleTracker = () => {
    const plausible = useContext(PlausibleContext);

    return useCallback(
        (
            eventName: string,
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
};
