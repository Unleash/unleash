import { type ElementMatch, parseElementMatch } from './elementMatch.ts';
import { isValidPagePattern } from './pagePattern.ts';

export type PageViewTriggerCondition = { on: 'page' };

export type ElementAppearTriggerCondition = { on: 'appear' } & ElementMatch;

export type ElementClickTriggerCondition = { on: 'click' } & ElementMatch;

export type ElementTriggerCondition =
    | ElementAppearTriggerCondition
    | ElementClickTriggerCondition;

export type CustomEventTriggerCondition = { on: 'event'; name: string };

export type TriggerCondition =
    | PageViewTriggerCondition
    | ElementTriggerCondition
    | CustomEventTriggerCondition;

export const isElementCondition = (
    on: TriggerCondition['on'],
): on is ElementTriggerCondition['on'] => on === 'appear' || on === 'click';

export type SurveyTrigger = TriggerCondition & {
    path?: string;
    delayMs?: number;
    onOccurrence?: number;
};

const isIntegerAtLeast = (value: unknown, min: number): value is number =>
    Number.isInteger(value) && (value as number) >= min;

export const isValidDelayMs = (value: unknown): value is number =>
    isIntegerAtLeast(value, 0);

export const isValidOccurrence = (value: unknown): value is number =>
    isIntegerAtLeast(value, 1);

const parseCondition = (
    raw: Record<string, unknown>,
): TriggerCondition | null => {
    switch (raw.on) {
        case 'page':
            return { on: 'page' };
        case 'appear': {
            const match = parseElementMatch(raw);
            return match === null ? null : { on: 'appear', ...match };
        }
        case 'click': {
            const match = parseElementMatch(raw);
            return match === null ? null : { on: 'click', ...match };
        }
        case 'event':
            return typeof raw.name === 'string' && raw.name.trim().length > 0
                ? { on: 'event', name: raw.name }
                : null;
        default:
            return null;
    }
};

export const parseTrigger = (
    raw: Record<string, unknown>,
): SurveyTrigger | null => {
    const condition = parseCondition(raw);
    if (condition === null) {
        return null;
    }
    if (
        raw.path !== undefined &&
        (typeof raw.path !== 'string' || !isValidPagePattern(raw.path))
    ) {
        return null;
    }
    if (raw.delayMs !== undefined && !isValidDelayMs(raw.delayMs)) {
        return null;
    }
    if (
        raw.onOccurrence !== undefined &&
        !isValidOccurrence(raw.onOccurrence)
    ) {
        return null;
    }
    return {
        ...condition,
        ...(raw.path === undefined ? {} : { path: raw.path }),
        ...(raw.delayMs === undefined ? {} : { delayMs: raw.delayMs }),
        ...(raw.onOccurrence === undefined
            ? {}
            : { onOccurrence: raw.onOccurrence }),
    };
};
