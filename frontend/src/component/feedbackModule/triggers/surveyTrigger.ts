import { isValidPagePattern } from './pagePattern.ts';

export type TriggerCondition = { on: 'page' };

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
): TriggerCondition | null => (raw.on === 'page' ? { on: 'page' } : null);

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
