import { createUuid } from 'utils/createUuid';
import {
    DEFAULT_RATING_SCALE,
    SURVEY_KIND,
    SURVEY_VERSION,
    type SurveyQuestion,
} from '../survey.ts';

export type QuestionType = SurveyQuestion['type'];

export type QuestionDraft = SurveyQuestion & { key: string };

export interface SurveyDraft {
    title: string;
    description: string;
    questions: QuestionDraft[];
}

export interface QuestionErrors {
    id?: string;
    prompt?: string;
    options?: (string | undefined)[];
}

export interface SurveyErrors {
    title?: string;
    questions: QuestionErrors[];
}

const unusedId = (questions: QuestionDraft[]): string => {
    for (let number = questions.length + 1; ; number++) {
        const id = `question-${number}`;
        if (!questions.some((question) => question.id.trim() === id)) {
            return id;
        }
    }
};

export const withType = (
    { key, id, prompt, required }: QuestionDraft,
    type: QuestionType,
): QuestionDraft => {
    const base = { key, id, prompt, required };
    switch (type) {
        case 'free-text':
            return { ...base, type };
        case 'rating':
            return { ...base, type, scale: DEFAULT_RATING_SCALE };
        case 'multi-choice':
            return { ...base, type, options: [''] };
    }
};

export const newQuestion = (questions: QuestionDraft[]): QuestionDraft => ({
    key: createUuid(),
    id: unusedId(questions),
    type: 'rating',
    prompt: '',
    required: false,
    scale: DEFAULT_RATING_SCALE,
});

export const initialSurveyDraft = (): SurveyDraft => ({
    title: 'How was creating your flag?',
    description: 'Three quick questions.',
    questions: [
        {
            key: createUuid(),
            id: 'ease',
            type: 'rating',
            prompt: 'How easy was it?',
            required: true,
            scale: DEFAULT_RATING_SCALE,
        },
        {
            key: createUuid(),
            id: 'role',
            type: 'multi-choice',
            prompt: 'What is your role?',
            required: false,
            options: ['Developer', 'PM', 'Other'],
        },
        {
            key: createUuid(),
            id: 'comment',
            type: 'free-text',
            prompt: 'Anything else?',
            required: false,
        },
    ],
});

const validateOptions = (options: string[]): (string | undefined)[] =>
    options.map((option, index) => {
        const trimmed = option.trim();
        if (trimmed === '') {
            return 'Enter an option';
        }
        return options.findIndex((other) => other.trim() === trimmed) < index
            ? 'This option is already listed'
            : undefined;
    });

export const validateSurveyDraft = (draft: SurveyDraft): SurveyErrors => {
    const ids = draft.questions.map(({ id }) => id.trim());
    return {
        title: draft.title.trim() === '' ? 'Enter a title' : undefined,
        questions: draft.questions.map((question, index) => ({
            id:
                ids[index] === ''
                    ? 'Enter an ID'
                    : ids.indexOf(ids[index]) < index
                      ? 'Another question already uses this ID'
                      : undefined,
            prompt:
                question.prompt.trim() === '' ? 'Enter a question' : undefined,
            options:
                question.type === 'multi-choice'
                    ? validateOptions(question.options)
                    : undefined,
        })),
    };
};

export const hasSurveyErrors = (errors: SurveyErrors): boolean =>
    Boolean(errors.title) ||
    errors.questions.some(
        ({ id, prompt, options = [] }) =>
            Boolean(id) || Boolean(prompt) || options.some(Boolean),
    );

const toQuestion = (draft: QuestionDraft): SurveyQuestion => {
    const base = {
        id: draft.id.trim(),
        prompt: draft.prompt.trim(),
        required: draft.required,
    };
    switch (draft.type) {
        case 'free-text':
            return { ...base, type: 'free-text' };
        case 'rating':
            return { ...base, type: 'rating', scale: draft.scale };
        case 'multi-choice':
            return {
                ...base,
                type: 'multi-choice',
                options: draft.options.map((option) => option.trim()),
            };
    }
};

export const toSurveyJson = (draft: SurveyDraft): string =>
    JSON.stringify(
        {
            kind: SURVEY_KIND,
            version: SURVEY_VERSION,
            title: draft.title.trim(),
            description: draft.description.trim(),
            questions: draft.questions.map(toQuestion),
        },
        null,
        2,
    );
