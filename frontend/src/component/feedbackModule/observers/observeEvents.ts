import type { Unsubscribe } from './observePage.ts';

export type EventObserver = (
    onEvent: (name: string) => void,
    eventNames: string[],
) => Unsubscribe;

export const observeBrowserEvents: EventObserver = () => () => {};
