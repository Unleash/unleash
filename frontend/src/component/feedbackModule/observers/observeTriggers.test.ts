import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SurveyTrigger } from '../triggers/surveyTrigger.ts';
import type { TriggerEvent } from '../triggers/triggerEvent.ts';
import type { PageObserver, Unsubscribe } from './observePage.ts';
import { observeTriggers } from './observeTriggers.ts';

const BASE_PATH = '/unleash';

const fakePageObserver = (initialPath: string) => {
    let onPageChange: ((path: string) => void) | null = null;
    let installedBasePath: string | null = null;
    const observe: PageObserver = (callback, basePath) => {
        onPageChange = callback;
        installedBasePath = basePath;
        callback(initialPath);
        return () => {
            onPageChange = null;
        };
    };
    return {
        observe,
        navigate: (path: string) => onPageChange?.(path),
        isInstalled: () => onPageChange !== null,
        installedBasePath: () => installedBasePath,
    };
};

const fakeElementObserver = () => {
    const subscribers: ((element: Element) => void)[] = [];
    const observe = (callback: (element: Element) => void): Unsubscribe => {
        subscribers.push(callback);
        return () => {
            const index = subscribers.indexOf(callback);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
        };
    };
    return {
        observe,
        emit: (element: Element) => {
            for (const subscriber of subscribers) {
                subscriber(element);
            }
        },
        isInstalled: () => subscribers.length > 0,
    };
};

const CLICK_CREATE_FLAG: SurveyTrigger = {
    on: 'click',
    selector: '[data-testid="create-flag"]',
};

const APPEAR_TOAST: SurveyTrigger = {
    on: 'appear',
    selector: '[data-testid="toast"]',
};

describe('observeTriggers', () => {
    let pageObserver: ReturnType<typeof fakePageObserver>;
    let clickObserver: ReturnType<typeof fakeElementObserver>;
    let appearObserver: ReturnType<typeof fakeElementObserver>;
    let emitted: TriggerEvent[];
    let unsubscribe: Unsubscribe | undefined;

    const install = (triggers: SurveyTrigger[]) => {
        unsubscribe = observeTriggers(
            triggers,
            (event) => emitted.push(event),
            {
                observePage: pageObserver.observe,
                observeClicks: clickObserver.observe,
                observeAppear: appearObserver.observe,
                basePath: BASE_PATH,
            },
        );
    };

    beforeEach(() => {
        pageObserver = fakePageObserver('/projects');
        clickObserver = fakeElementObserver();
        appearObserver = fakeElementObserver();
        emitted = [];
        unsubscribe = undefined;
    });

    afterEach(() => {
        unsubscribe?.();
    });

    it('emits the page open at install and every page navigated to', () => {
        install([{ on: 'page' }]);

        pageObserver.navigate('/features');

        expect(emitted).toEqual([
            { on: 'page', path: '/projects' },
            { on: 'page', path: '/features' },
        ]);
    });

    it('observes pages under the app base path', () => {
        install([{ on: 'page' }]);

        expect(pageObserver.installedBasePath()).toBe(BASE_PATH);
    });

    it('stamps a click with the page the user is currently on', () => {
        install([CLICK_CREATE_FLAG]);
        const target = document.createElement('button');

        pageObserver.navigate('/projects/default');
        clickObserver.emit(target);

        expect(emitted.at(-1)).toEqual({
            on: 'click',
            path: '/projects/default',
            target,
        });
    });

    it('does not observe clicks without a click trigger', () => {
        install([{ on: 'page' }]);

        expect(clickObserver.isInstalled()).toBe(false);
    });

    it('observes clicks only on pages a click trigger matches', () => {
        install([{ ...CLICK_CREATE_FLAG, path: '/projects/*' }]);
        expect(clickObserver.isInstalled()).toBe(false);

        pageObserver.navigate('/projects/default');

        expect(clickObserver.isInstalled()).toBe(true);

        pageObserver.navigate('/features');

        expect(clickObserver.isInstalled()).toBe(false);
    });

    it('observes appearances only on pages an appear trigger matches', () => {
        install([{ ...APPEAR_TOAST, path: '/projects/*' }]);
        expect(appearObserver.isInstalled()).toBe(false);

        pageObserver.navigate('/projects/default');

        expect(appearObserver.isInstalled()).toBe(true);

        pageObserver.navigate('/features');

        expect(appearObserver.isInstalled()).toBe(false);
    });

    it('observes appearances once while moving between pages an appear trigger matches', () => {
        install([{ ...APPEAR_TOAST, path: '/projects/*' }]);
        const added = document.createElement('div');

        pageObserver.navigate('/projects/a');
        pageObserver.navigate('/projects/b');
        appearObserver.emit(added);

        expect(emitted.filter((event) => event.on === 'appear')).toEqual([
            { on: 'appear', path: '/projects/b', added },
        ]);
    });

    it('does not observe appearances without an appear trigger', () => {
        install([CLICK_CREATE_FLAG]);

        expect(appearObserver.isInstalled()).toBe(false);
    });

    it('stamps an appearance with the page the user is currently on', () => {
        install([APPEAR_TOAST]);
        const added = document.createElement('div');

        pageObserver.navigate('/projects/default');
        appearObserver.emit(added);

        expect(emitted.at(-1)).toEqual({
            on: 'appear',
            path: '/projects/default',
            added,
        });
    });

    it('stops observing every source on unsubscribe', () => {
        install([CLICK_CREATE_FLAG, APPEAR_TOAST]);
        expect(clickObserver.isInstalled()).toBe(true);
        expect(appearObserver.isInstalled()).toBe(true);

        unsubscribe?.();

        expect(pageObserver.isInstalled()).toBe(false);
        expect(clickObserver.isInstalled()).toBe(false);
        expect(appearObserver.isInstalled()).toBe(false);
    });
});
