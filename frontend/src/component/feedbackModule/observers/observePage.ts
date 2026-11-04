import { appPath } from './appPath.ts';

export type Unsubscribe = () => void;

type Poll = (callback: () => void) => Unsubscribe;

interface ObservePageOptions {
    basePath: string;
    getLocation: () => Pick<Location, 'pathname'>;
    navigation: EventTarget | undefined;
    page: EventTarget;
    poll: Poll;
}

/**
 * Calls `onPageChange` with the app path at install and after each path change.
 *
 * Uses the Navigation API when available and falls back to polling when it
 * is not. With the Navigation API, every committed path change is reported.
 * With polling, only the path seen at each poll is reported: going
 * A -> B -> A between two polls looks like no change.
 */
export const observePage = (
    onPageChange: (path: string) => void,
    { basePath, getLocation, navigation, page, poll }: ObservePageOptions,
): Unsubscribe => {
    const subscription = new AbortController();
    const listenerOptions = { signal: subscription.signal };

    const currentPath = () => appPath(getLocation().pathname, basePath);

    let lastPath = currentPath();
    onPageChange(lastPath);

    const emitIfPathChanged = () => {
        const path = currentPath();
        if (path === lastPath) {
            return;
        }
        lastPath = path;
        onPageChange(path);
    };

    const emitOnBackForwardCacheRestore = (event: Event) => {
        if (!(event instanceof PageTransitionEvent && event.persisted)) {
            return;
        }
        lastPath = currentPath();
        onPageChange(lastPath);
    };

    page.addEventListener(
        'pageshow',
        emitOnBackForwardCacheRestore,
        listenerOptions,
    );

    if (navigation) {
        navigation.addEventListener(
            'currententrychange',
            emitIfPathChanged,
            listenerOptions,
        );
        return () => subscription.abort();
    }

    const stopPolling = poll(emitIfPathChanged);
    return () => {
        stopPolling();
        subscription.abort();
    };
};

const POLLING_INTERVAL_MS = 250;

const pollEveryInterval: Poll = (callback) => {
    const interval = setInterval(callback, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
};

const browserNavigation = (): EventTarget | undefined =>
    'navigation' in window ? navigation : undefined;

export type PageObserver = (
    onPageChange: (path: string) => void,
    basePath: string,
) => Unsubscribe;

export const observeBrowserPage: PageObserver = (onPageChange, basePath) =>
    observePage(onPageChange, {
        basePath,
        getLocation: () => location,
        navigation: browserNavigation(),
        page: window,
        poll: pollEveryInterval,
    });
