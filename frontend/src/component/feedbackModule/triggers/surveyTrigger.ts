import { isValidPagePattern } from './pagePattern.ts';

export type TriggerCondition = { on: 'page' };

export type SurveyTrigger = TriggerCondition & {
    path?: string;
};

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
    if (raw.path === undefined) {
        return condition;
    }
    if (typeof raw.path !== 'string' || !isValidPagePattern(raw.path)) {
        return null;
    }
    return { ...condition, path: raw.path };
};
