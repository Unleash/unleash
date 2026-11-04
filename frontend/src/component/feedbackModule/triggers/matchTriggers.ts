import type { Survey } from '../survey.ts';
import type { SurveyTrigger } from './surveyTrigger.ts';
import { canMatchPages, toPagePattern } from './pagePattern.ts';

const matchesPage = (trigger: SurveyTrigger, path: string): boolean => {
    if (trigger.path === undefined) {
        return true;
    }
    if (!canMatchPages()) {
        return false;
    }
    return toPagePattern(trigger.path)?.test({ pathname: path }) ?? false;
};

export const matchTriggers = (path: string, surveys: Survey[]): Survey[] =>
    surveys.filter(({ trigger }) => matchesPage(trigger, path));
