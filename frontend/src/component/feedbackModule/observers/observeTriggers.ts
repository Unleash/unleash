import { basePath as appBasePath } from 'utils/formatPath';
import { unique } from 'utils/unique';
import { matchesPage } from '../triggers/matchTriggers.ts';
import type {
    ElementTriggerCondition,
    SurveyTrigger,
} from '../triggers/surveyTrigger.ts';
import type { TriggerEvent } from '../triggers/triggerEvent.ts';
import { type AppearObserver, observeBrowserAppear } from './observeAppear.ts';
import { type ClickObserver, observeBrowserClicks } from './observeClicks.ts';
import { type EventObserver, observeBrowserEvents } from './observeEvents.ts';
import {
    observeBrowserPage,
    type PageObserver,
    type Unsubscribe,
} from './observePage.ts';

export type TriggerObserver = (
    triggers: SurveyTrigger[],
    onTrigger: (event: TriggerEvent) => void,
) => Unsubscribe;

interface TriggerSources {
    observePage: PageObserver;
    observeClicks: ClickObserver;
    observeAppear: AppearObserver;
    observeEvents: EventObserver;
    basePath: string;
}

const customEventNames = (triggers: SurveyTrigger[]): string[] =>
    unique(
        triggers.flatMap((trigger) =>
            trigger.on === 'event' ? [trigger.name] : [],
        ),
    ).toSorted();

type ElementObserver = (onElement: (element: Element) => void) => Unsubscribe;

const subscribeWhile = (
    wanted: boolean,
    current: Unsubscribe | null,
    observe: ElementObserver,
    onElement: (element: Element) => void,
): Unsubscribe | null => {
    if (wanted) {
        return current ?? observe(onElement);
    }
    current?.();
    return null;
};

export const observeTriggers = (
    triggers: SurveyTrigger[],
    onTrigger: (event: TriggerEvent) => void,
    {
        observePage,
        observeClicks,
        observeAppear,
        observeEvents,
        basePath,
    }: TriggerSources,
): Unsubscribe => {
    let currentPath = '';
    let stopObservingClicks: Unsubscribe | null = null;
    let stopObservingAppear: Unsubscribe | null = null;

    const onClick = (target: Element) =>
        onTrigger({ on: 'click', path: currentPath, target });

    const onAppear = (added: Element) =>
        onTrigger({ on: 'appear', path: currentPath, added });

    const onEvent = (name: string) =>
        onTrigger({ on: 'event', path: currentPath, name });

    const hasTriggerOn = (on: ElementTriggerCondition['on']) =>
        triggers.some(
            (trigger) => trigger.on === on && matchesPage(trigger, currentPath),
        );

    const onPageChange = (path: string) => {
        currentPath = path;
        onTrigger({ on: 'page', path });
        stopObservingClicks = subscribeWhile(
            hasTriggerOn('click'),
            stopObservingClicks,
            observeClicks,
            onClick,
        );
        stopObservingAppear = subscribeWhile(
            hasTriggerOn('appear'),
            stopObservingAppear,
            observeAppear,
            onAppear,
        );
    };

    const stopObservingPage = observePage(onPageChange, basePath);

    const eventNames = customEventNames(triggers);
    const stopObservingEvents =
        eventNames.length > 0 ? observeEvents(eventNames, onEvent) : null;

    return () => {
        stopObservingPage();
        stopObservingClicks?.();
        stopObservingAppear?.();
        stopObservingEvents?.();
    };
};

export const observeBrowserTriggers: TriggerObserver = (triggers, onTrigger) =>
    observeTriggers(triggers, onTrigger, {
        observePage: observeBrowserPage,
        observeClicks: observeBrowserClicks,
        observeAppear: observeBrowserAppear,
        observeEvents: observeBrowserEvents,
        basePath: appBasePath,
    });
