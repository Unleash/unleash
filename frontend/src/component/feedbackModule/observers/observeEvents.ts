import type { Unsubscribe } from './observePage.ts';

export type EventObserver = (
    eventNames: string[],
    onEvent: (name: string) => void,
) => Unsubscribe;

export const observeEvents = (
    eventNames: string[],
    onEvent: (name: string) => void,
    target: EventTarget,
): Unsubscribe => {
    const subscription = new AbortController();
    for (const name of eventNames) {
        target.addEventListener(name, () => onEvent(name), {
            signal: subscription.signal,
        });
    }
    return () => subscription.abort();
};

export const observeBrowserEvents: EventObserver = (eventNames, onEvent) =>
    observeEvents(eventNames, onEvent, document);
