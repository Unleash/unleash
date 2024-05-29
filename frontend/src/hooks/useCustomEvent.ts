import { useCallback, useEffect } from 'react';

/**
 * A hook that provides methods to emit and listen to custom DOM events.
 * @param eventName The name of the event to listen for and dispatch.
 */
export const useCustomEvent = (
    eventName: string,
    handler: (event: CustomEvent) => void,
) => {
    const emitEvent = useCallback(() => {
        const event = new CustomEvent(eventName);
        document.dispatchEvent(event);
    }, [eventName]);

    useEffect(() => {
        const eventListener = (event: Event) => handler(event as CustomEvent);

        document.addEventListener(eventName, eventListener);

        return () => {
            document.removeEventListener(eventName, eventListener);
        };
    }, [eventName, handler]);

    return { emitEvent };
};
