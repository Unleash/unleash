import { describe, expect, it } from 'vitest';
import { parseSurveyDefinition } from '../survey.ts';
import {
    hasSurveyErrors,
    initialSurveyDraft,
    newQuestion,
    type QuestionDraft,
    type SurveyDraft,
    toSurveyJson,
    validateSurveyDraft,
    withType,
} from './surveyDraft.ts';

const draftQuestion = (
    fields: Partial<Pick<QuestionDraft, 'id' | 'prompt' | 'required'>> = {},
) => ({
    key: 'key',
    id: 'why',
    type: 'free-text' as const,
    prompt: 'Why?',
    required: false,
    ...fields,
});

const choiceQuestion = (options: string[]): QuestionDraft => ({
    ...draftQuestion(),
    type: 'multi-choice',
    options,
});

const draftWith = (questions: QuestionDraft[]): SurveyDraft => ({
    title: 'Survey',
    description: '',
    questions,
});

describe('toSurveyJson', () => {
    it('turns the starting draft into a valid survey', () => {
        const draft = initialSurveyDraft();

        expect(hasSurveyErrors(validateSurveyDraft(draft))).toBe(false);
        expect(parseSurveyDefinition(toSurveyJson(draft))).not.toBeNull();
    });

    it('turns every question type into its survey fields, trimmed', () => {
        const draft = {
            title: ' Survey ',
            description: ' About you ',
            questions: [
                draftQuestion({ id: ' why ', prompt: ' Why? ' }),
                { ...choiceQuestion([' Dev ', 'PM']), id: 'role' },
                {
                    ...draftQuestion({ id: 'ease', required: true }),
                    type: 'rating' as const,
                    scale: 7,
                },
            ],
        };

        expect(JSON.parse(toSurveyJson(draft))).toEqual({
            kind: 'unleash-survey',
            version: 1,
            title: 'Survey',
            description: 'About you',
            questions: [
                {
                    id: 'why',
                    type: 'free-text',
                    prompt: 'Why?',
                    required: false,
                },
                {
                    id: 'role',
                    type: 'multi-choice',
                    prompt: 'Why?',
                    required: false,
                    options: ['Dev', 'PM'],
                },
                {
                    id: 'ease',
                    type: 'rating',
                    prompt: 'Why?',
                    required: true,
                    scale: 7,
                },
            ],
        });
    });
});

describe('newQuestion', () => {
    it('gets an ID no other question uses', () => {
        const questions = [
            draftQuestion({ id: 'question-2' }),
            draftQuestion({ id: ' question-3 ' }),
        ];

        expect(newQuestion(questions).id).toBe('question-4');
    });
});

describe('withType', () => {
    it('carries over only the fields every question type has', () => {
        const question = {
            ...choiceQuestion(['Dev']),
            id: 'role',
            prompt: 'What is your role?',
            required: true,
        };

        expect(withType(question, 'rating')).toEqual({
            key: 'key',
            id: 'role',
            type: 'rating',
            prompt: 'What is your role?',
            required: true,
            scale: 5,
        });
    });
});

describe('validateSurveyDraft', () => {
    it('requires a title', () => {
        const draft = { ...draftWith([draftQuestion()]), title: '  ' };

        expect(validateSurveyDraft(draft).title).toBe('Enter a title');
    });

    it.each([
        ['an empty ID', { id: ' ' }, { id: 'Enter an ID' }],
        ['an empty question', { prompt: ' ' }, { prompt: 'Enter a question' }],
    ])('rejects %s', (_, fields, expected) => {
        const draft = draftWith([draftQuestion(fields)]);

        expect(validateSurveyDraft(draft).questions[0]).toMatchObject(expected);
    });

    it('rejects a question ID that an earlier question uses', () => {
        const draft = draftWith([
            draftQuestion({ id: 'same' }),
            draftQuestion({ id: ' same ' }),
        ]);

        expect(
            validateSurveyDraft(draft).questions.map(({ id }) => id),
        ).toEqual([undefined, 'Another question already uses this ID']);
    });

    it('rejects empty and repeated options of a multiple choice question', () => {
        const draft = draftWith([choiceQuestion(['Dev', '', 'Dev '])]);

        expect(validateSurveyDraft(draft).questions[0].options).toEqual([
            undefined,
            'Enter an option',
            'This option is already listed',
        ]);
    });

    it.each([
        ['the title', { ...draftWith([draftQuestion()]), title: '' }],
        ['a question prompt', draftWith([draftQuestion({ prompt: '' })])],
        ['a question ID', draftWith([draftQuestion({ id: '' })])],
        ['an option', draftWith([choiceQuestion([''])])],
    ])('reports an error in %s', (_, draft) => {
        expect(hasSurveyErrors(validateSurveyDraft(draft))).toBe(true);
    });
});
