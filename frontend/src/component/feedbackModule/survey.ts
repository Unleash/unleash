import { PayloadType } from 'utils/variants';

export const SURVEY_FLAG_PREFIX = 'survey-';
export const SURVEY_KIND = 'unleash-survey';
export const SURVEY_VERSION = 1;
export const DEFAULT_RATING_SCALE = 5;
export const MIN_RATING_SCALE = 2;
export const MAX_RATING_SCALE = 10;
export const MAX_QUESTIONS = 10;

interface QuestionBase {
    id: string;
    prompt: string;
    required: boolean;
}

export type SurveyQuestion =
    | (QuestionBase & { type: 'free-text' })
    | (QuestionBase & { type: 'rating'; scale: number })
    | (QuestionBase & { type: 'multi-choice'; options: string[] });

export type SurveyAnswer = number | string | string[];

export type SurveyAnswers = Record<string, SurveyAnswer>;

export interface SurveyDefinition {
    title: string;
    description: string;
    questions: SurveyQuestion[];
}

export interface SurveyTransport {
    flagName: string;
    environmentId: string;
    submitBase: string;
}

export type Survey = SurveyDefinition & SurveyTransport;

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseSubmitBase = (value: unknown): string | null => {
    if (typeof value !== 'string') {
        return null;
    }
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        return null;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        return null;
    }
    return value.replace(/\/+$/, '');
};

const parseRatingScale = (scale: unknown): number | null => {
    if (scale === undefined) {
        return DEFAULT_RATING_SCALE;
    }
    return Number.isInteger(scale) &&
        (scale as number) >= MIN_RATING_SCALE &&
        (scale as number) <= MAX_RATING_SCALE
        ? (scale as number)
        : null;
};

const parseOptions = (options: unknown): string[] | null => {
    if (
        !Array.isArray(options) ||
        options.length === 0 ||
        !options.every(isNonEmptyString)
    ) {
        return null;
    }
    // Options are both the checkbox keys and the answer values, so duplicates
    // couldn't be told apart.
    return new Set(options).size === options.length ? options : null;
};

const parseQuestion = (raw: unknown): SurveyQuestion | null => {
    if (!isObject(raw)) {
        return null;
    }
    if (!isNonEmptyString(raw.id) || !isNonEmptyString(raw.prompt)) {
        return null;
    }
    const base = {
        id: raw.id,
        prompt: raw.prompt,
        required: raw.required === true,
    };
    switch (raw.type) {
        case 'free-text':
            return { ...base, type: 'free-text' };
        case 'rating': {
            const scale = parseRatingScale(raw.scale);
            return scale === null ? null : { ...base, type: 'rating', scale };
        }
        case 'multi-choice': {
            const options = parseOptions(raw.options);
            return options === null
                ? null
                : { ...base, type: 'multi-choice', options };
        }
        default:
            return null;
    }
};

const parseJsonObject = (json: string): Record<string, unknown> | null => {
    let raw: unknown;
    try {
        raw = JSON.parse(json);
    } catch {
        return null;
    }
    return isObject(raw) ? raw : null;
};

const parseDefinition = (
    raw: Record<string, unknown>,
): SurveyDefinition | null => {
    if (raw.kind !== SURVEY_KIND || raw.version !== SURVEY_VERSION) {
        return null;
    }
    if (!isNonEmptyString(raw.title)) {
        return null;
    }
    if (
        !Array.isArray(raw.questions) ||
        raw.questions.length === 0 ||
        raw.questions.length > MAX_QUESTIONS
    ) {
        return null;
    }

    const questions: SurveyQuestion[] = [];
    for (const rawQuestion of raw.questions) {
        const question = parseQuestion(rawQuestion);
        if (question === null) {
            return null;
        }
        questions.push(question);
    }
    // Question ids are the keys of the answers, so duplicates would overwrite each other.
    if (new Set(questions.map(({ id }) => id)).size !== questions.length) {
        return null;
    }

    return {
        title: raw.title,
        description: typeof raw.description === 'string' ? raw.description : '',
        questions,
    };
};

export const parseSurveyDefinition = (
    json: string,
): SurveyDefinition | null => {
    const raw = parseJsonObject(json);
    return raw === null ? null : parseDefinition(raw);
};

export const parseSurveyPayload = (
    flagName: string,
    payload: { type: string; value: string } | undefined,
): Survey | null => {
    if (
        !flagName.startsWith(SURVEY_FLAG_PREFIX) ||
        payload?.type !== PayloadType.JSON
    ) {
        return null;
    }

    const raw = parseJsonObject(payload.value);
    if (raw === null || !isNonEmptyString(raw.environmentId)) {
        return null;
    }
    const submitBase = parseSubmitBase(raw.submitBase);
    if (submitBase === null) {
        return null;
    }
    const definition = parseDefinition(raw);
    if (definition === null) {
        return null;
    }

    return {
        flagName,
        environmentId: raw.environmentId,
        submitBase,
        ...definition,
    };
};
