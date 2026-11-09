import type { Unsubscribe } from './observePage.ts';

export type ClickObserver = (onClick: (target: Element) => void) => Unsubscribe;

export const observeClicks = (
    onClick: (target: Element) => void,
    page: EventTarget,
): Unsubscribe => {
    const subscription = new AbortController();
    page.addEventListener(
        'click',
        (event) => {
            if (event.target instanceof Element) {
                onClick(event.target);
            }
        },
        { capture: true, signal: subscription.signal },
    );
    return () => subscription.abort();
};

export const observeBrowserClicks: ClickObserver = (onClick) =>
    observeClicks(onClick, document);
