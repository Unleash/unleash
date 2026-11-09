import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { observePage } from './observePage.ts';

const manualPoll = () => {
    let callback: (() => void) | undefined;
    return {
        poll: (pollCallback: () => void) => {
            callback = pollCallback;
            return () => {
                callback = undefined;
            };
        },
        tick: () => callback?.(),
    };
};

describe('observePage', () => {
    let emitted: string[];
    let unsubscribe: (() => void) | undefined;
    let currentUrl: URL;
    let page: EventTarget;
    let polling: ReturnType<typeof manualPoll>;

    const navigateTo = (url: string) => {
        currentUrl = new URL(url, 'http://localhost');
    };

    const subscribe = (navigation?: EventTarget) => {
        unsubscribe = observePage((path) => emitted.push(path), {
            basePath: '/unleash',
            getLocation: () => currentUrl,
            navigation,
            page,
            poll: polling.poll,
        });
    };

    const install = (navigation?: EventTarget) => {
        subscribe(navigation);
        emitted = [];
    };

    const showPage = (persisted: boolean) =>
        page.dispatchEvent(new PageTransitionEvent('pageshow', { persisted }));

    const restoreFromBackForwardCache = () => showPage(true);

    const loadFresh = () => showPage(false);

    beforeEach(() => {
        polling = manualPoll();
        page = new EventTarget();
        navigateTo('/unleash/projects');
        emitted = [];
        unsubscribe = undefined;
    });

    afterEach(() => {
        unsubscribe?.();
    });

    it('emits the app path of the page open at install', () => {
        subscribe();

        expect(emitted).toEqual(['/projects']);
    });

    describe('without the Navigation API', () => {
        beforeEach(() => {
            install();
        });

        it('emits nothing until the next poll runs', () => {
            navigateTo('/unleash/features');

            expect(emitted).toEqual([]);
        });

        it('emits the app path once the next poll sees a new pathname', () => {
            navigateTo('/unleash/features');

            polling.tick();

            expect(emitted).toEqual(['/features']);
        });

        it('emits only the pathname seen by the poll when several navigations happen between polls', () => {
            navigateTo('/unleash/features');
            navigateTo('/unleash/segments');
            polling.tick();

            expect(emitted).toEqual(['/segments']);
        });

        it('stops emitting after unsubscribe', () => {
            unsubscribe?.();
            navigateTo('/unleash/features');
            polling.tick();

            expect(emitted).toEqual([]);
        });
    });

    describe('with the Navigation API', () => {
        let navigationTarget: EventTarget;

        const commitNavigation = (url: string) => {
            navigateTo(url);
            navigationTarget.dispatchEvent(new Event('currententrychange'));
        };

        beforeEach(() => {
            navigationTarget = new EventTarget();
            install(navigationTarget);
        });

        it('emits the app path when the current entry changes to a new pathname', () => {
            commitNavigation('/unleash/features');

            expect(emitted).toEqual(['/features']);
        });

        it('emits nothing when only the query or hash changes', () => {
            commitNavigation('/unleash/projects?sort=name');
            commitNavigation('/unleash/projects#details');

            expect(emitted).toEqual([]);
        });

        it('emits nothing when only a trailing slash is added', () => {
            commitNavigation('/unleash/projects/');

            expect(emitted).toEqual([]);
        });

        it('emits a new pathname once even when later entries stay on it', () => {
            commitNavigation('/unleash/features');
            commitNavigation('/unleash/features?sort=name');
            commitNavigation('/unleash/features');

            expect(emitted).toEqual(['/features']);
        });

        it('ignores pathname changes that are not committed as a navigation entry', () => {
            navigateTo('/unleash/features');
            polling.tick();

            expect(emitted).toEqual([]);
        });

        it('stops emitting after unsubscribe', () => {
            unsubscribe?.();
            commitNavigation('/unleash/features');

            expect(emitted).toEqual([]);
        });
    });

    describe('when the page is restored from the back/forward cache', () => {
        it.each([
            ['without the Navigation API', () => install()],
            ['with the Navigation API', () => install(new EventTarget())],
        ])('%s, emits the current app path again', (_, installObserver) => {
            installObserver();

            restoreFromBackForwardCache();

            expect(emitted).toEqual(['/projects']);
        });

        it('emits nothing on a fresh page load', () => {
            install();

            loadFresh();

            expect(emitted).toEqual([]);
        });

        it('emits the pathname that changed while the page was cached only once', () => {
            install();

            navigateTo('/unleash/features');
            restoreFromBackForwardCache();
            polling.tick();

            expect(emitted).toEqual(['/features']);
        });

        it('stops emitting after unsubscribe', () => {
            install();
            unsubscribe?.();

            restoreFromBackForwardCache();

            expect(emitted).toEqual([]);
        });
    });
});
