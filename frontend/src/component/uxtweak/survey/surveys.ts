import type { IToggle } from '@unleash/proxy-client-react';
import { normalizePath } from 'utils/normalizePath';
import { PayloadType } from 'utils/variants';

export const SURVEY_FLAG_PREFIX = 'uxtweak-survey-';
export const MAX_QUESTIONS = 10;

interface QuestionBase {
    id: string;
    prompt: string;
    required: boolean;
}

export type SurveyQuestionConfig =
    | (QuestionBase & { type: 'rating' })
    | (QuestionBase & { type: 'single'; options: string[] })
    | (QuestionBase & { type: 'text' });

export interface SurveyConfig {
    flagName: string;
    surveyId: string;
    page: string;
    title: string;
    intro: string;
    questions: SurveyQuestionConfig[];
    submitBase: string;
}

export const pageMatches = (page: string, pathname: string): boolean =>
    page === '*' || normalizePath(page) === normalizePath(pathname);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const parseQuestion = (raw: unknown): SurveyQuestionConfig | null => {
    if (typeof raw !== 'object' || raw === null) {
        return null;
    }
    const question = raw as Record<string, unknown>;
    if (!isNonEmptyString(question.id) || !isNonEmptyString(question.prompt)) {
        return null;
    }
    const base = {
        id: question.id,
        prompt: question.prompt,
        required: question.required === true,
    };
    switch (question.type) {
        case 'rating':
        case 'text':
            return { ...base, type: question.type };
        case 'single': {
            const options = question.options;
            if (!Array.isArray(options) || options.length === 0) {
                return null;
            }
            if (!options.every(isNonEmptyString)) {
                return null;
            }
            return { ...base, type: 'single', options };
        }
        default:
            return null;
    }
};

export const parseSurveyPayload = (
    flagName: string,
    payload: { type: string; value: string } | undefined,
): SurveyConfig | null => {
    if (payload?.type !== PayloadType.JSON) {
        return null;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(payload.value);
    } catch {
        return null;
    }
    if (typeof parsed !== 'object' || parsed === null) {
        return null;
    }
    const raw = parsed as Record<string, unknown>;

    if (raw.v !== 1) {
        return null;
    }
    if (
        !isNonEmptyString(raw.surveyId) ||
        !isNonEmptyString(raw.page) ||
        !isNonEmptyString(raw.title) ||
        !isNonEmptyString(raw.submitBase)
    ) {
        return null;
    }
    if (
        !Array.isArray(raw.questions) ||
        raw.questions.length === 0 ||
        raw.questions.length > MAX_QUESTIONS
    ) {
        return null;
    }

    const questions: SurveyQuestionConfig[] = [];
    for (const rawQuestion of raw.questions) {
        const question = parseQuestion(rawQuestion);
        if (question === null) {
            return null;
        }
        questions.push(question);
    }

    return {
        flagName,
        surveyId: raw.surveyId,
        page: raw.page,
        title: raw.title,
        intro: typeof raw.intro === 'string' ? raw.intro : '',
        questions,
        submitBase: normalizePath(raw.submitBase),
    };
};

export const scanSurveys = (
    flags: IToggle[],
    pathname: string,
): SurveyConfig[] =>
    flags
        .filter((flag) => flag.name.startsWith(SURVEY_FLAG_PREFIX))
        .map((flag) => parseSurveyPayload(flag.name, flag.variant?.payload))
        .filter((survey) => survey !== null)
        .filter((survey) => pageMatches(survey.page, pathname))
        .sort((a, b) => a.flagName.localeCompare(b.flagName));
