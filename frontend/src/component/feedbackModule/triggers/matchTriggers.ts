import type { Survey } from '../survey.ts';
import type { SurveyTrigger } from './surveyTrigger.ts';
import { matchesAddedElement, matchesElement } from './elementMatch.ts';
import { canMatchPages, toPagePattern } from './pagePattern.ts';

export type TriggerEvent =
    | { on: 'page'; path: string }
    | { on: 'click'; path: string; target: Element }
    | { on: 'appear'; path: string; added: Element };

const matchesPage = (trigger: SurveyTrigger, path: string): boolean => {
    if (trigger.path === undefined) {
        return true;
    }
    if (!canMatchPages()) {
        return false;
    }
    return toPagePattern(trigger.path)?.test({ pathname: path }) ?? false;
};

const matchesEvent = (trigger: SurveyTrigger, event: TriggerEvent): boolean => {
    if (!matchesPage(trigger, event.path)) {
        return false;
    }
    switch (trigger.on) {
        case 'page':
            return event.on === 'page';
        case 'click':
            return (
                event.on === 'click' && matchesElement(trigger, event.target)
            );
        case 'appear':
            return (
                event.on === 'appear' &&
                matchesAddedElement(trigger, event.added)
            );
        case 'event':
            return false;
    }
};

export const matchTriggers = (
    event: TriggerEvent,
    surveys: Survey[],
): Survey[] => surveys.filter(({ trigger }) => matchesEvent(trigger, event));
