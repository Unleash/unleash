import type { Unsubscribe } from './observePage.ts';

export type AppearObserver = (
    onAppear: (added: Element) => void,
) => Unsubscribe;

export const observeBrowserAppear: AppearObserver = () => () => {};
