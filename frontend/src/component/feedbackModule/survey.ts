import { PayloadType } from 'utils/variants';

export const SURVEY_FLAG_PREFIX = 'survey-';
export const SURVEY_KIND = 'unleash-survey';
const DEFAULT_RATING_SCALE = 5;
const MIN_RATING_SCALE = 2;
const MAX_RATING_SCALE = 10;
const MAX_QUESTIONS = 10;

interface QuestionBase {
    id: string;
    prompt: string;
    required: boolean;
}

export type SurveyQuestion =
    | (QuestionBase & { type: 'free-text' })
    | (QuestionBase & { type: 'rating'; scale: number })
    | (QuestionBase & { type: 'multi-choice'; options: string[] });

export type SurveyAnswer = number | string[] | string;

export type SurveyAnswers = Record<string, SurveyAnswer>;

export interface Survey {
    flagName: string;
    title: string;
    description: string;
    questions: SurveyQuestion[];
}

export const SURVEY_TEMPLATE = {
    kind: SURVEY_KIND,
    version: 1,
    title: 'How was creating your flag?',
    description: 'Three quick questions.',
    questions: [
        {
            id: 'ease',
            type: 'rating',
            prompt: 'How easy was it?',
            required: true,
            scale: DEFAULT_RATING_SCALE,
        },
        {
            id: 'role',
            type: 'multi-choice',
            prompt: 'What is your role?',
            options: ['Developer', 'PM', 'Other'],
        },
        { id: 'comment', type: 'free-text', prompt: 'Anything else?' },
    ],
};

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

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
            const options = raw.options;
            if (
                !Array.isArray(options) ||
                options.length === 0 ||
                !options.every(isNonEmptyString)
            ) {
                return null;
            }
            return { ...base, type: 'multi-choice', options };
        }
        default:
            return null;
    }
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

    let raw: unknown;
    try {
        raw = JSON.parse(payload.value);
    } catch {
        return null;
    }
    if (!isObject(raw)) {
        return null;
    }
    if (raw.kind !== SURVEY_KIND || raw.version !== 1) {
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
        flagName,
        title: raw.title,
        description: typeof raw.description === 'string' ? raw.description : '',
        questions,
    };
};
