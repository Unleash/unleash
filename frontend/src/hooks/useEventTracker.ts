import { useContext } from 'react';
import { EventTrackerContext } from 'contexts/EventTrackerContext';

export const useEventTracker = () => {
    const tracker = useContext(EventTrackerContext);
    return {
        trackEvent: tracker?.trackEvent ?? (() => {}),
    };
};
