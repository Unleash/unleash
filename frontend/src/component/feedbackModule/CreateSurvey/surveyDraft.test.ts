import { describe, expect, it } from 'vitest';
import { parseSurveyPayload } from '../survey.ts';
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
import { initialTriggerDraft } from './triggerDraft.ts';

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
    showTitleSlide: true,
    title: 'Survey',
    description: '',
    questions,
    trigger: initialTriggerDraft(),
});

const delivered = (surveyJson: string) => ({
    type: 'json',
    value: JSON.stringify({
        ...JSON.parse(surveyJson),
        environmentId: 'development',
        submitBase: 'https://app.unleash-hosted.com/hosted',
    }),
});

describe('toSurveyJson', () => {
    it('turns the starting draft into a valid survey', () => {
        const draft = initialSurveyDraft();

        expect(hasSurveyErrors(validateSurveyDraft(draft))).toBe(false);
        expect(
            parseSurveyPayload('survey-x', delivered(toSurveyJson(draft))),
        ).not.toBeNull();
    });

    it('turns every question type into its survey fields, trimmed', () => {
        const draft: SurveyDraft = {
            ...draftWith([]),
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
            trigger: { on: 'page' },
        });
    });

    it.each([
        [
            'every page when shown whenever enabled',
            { mode: 'always', path: ' /projects ' },
            { on: 'page' },
        ],
        [
            'every page when no page is entered',
            { mode: 'custom', path: ' ' },
            { on: 'page', delayMs: 500, onOccurrence: 3 },
        ],
        [
            'the page entered, trimmed',
            { mode: 'custom', path: ' /projects/:projectId ' },
            {
                on: 'page',
                path: '/projects/:projectId',
                delayMs: 500,
                onOccurrence: 3,
            },
        ],
        [
            'a click on an element matched by selector and text, trimmed',
            {
                mode: 'custom',
                on: 'click',
                path: ' /projects/:projectId ',
                selector: ' button ',
                text: ' Create flag ',
            },
            {
                on: 'click',
                selector: 'button',
                text: 'Create flag',
                path: '/projects/:projectId',
                delayMs: 500,
                onOccurrence: 3,
            },
        ],
        [
            'an element appearing',
            { mode: 'custom', on: 'appear', selector: '[role="alert"]' },
            {
                on: 'appear',
                selector: '[role="alert"]',
                delayMs: 500,
                onOccurrence: 3,
            },
        ],
        [
            'a click on an element matched by selector alone',
            { mode: 'custom', on: 'click', selector: 'button', text: ' ' },
            {
                on: 'click',
                selector: 'button',
                delayMs: 500,
                onOccurrence: 3,
            },
        ],
        [
            'a click on an element matched by text alone',
            { mode: 'custom', on: 'click', text: 'Create flag' },
            {
                on: 'click',
                text: 'Create flag',
                delayMs: 500,
                onOccurrence: 3,
            },
        ],
        [
            'the event named, trimmed',
            {
                mode: 'custom',
                on: 'event',
                path: ' /projects/:projectId ',
                eventName: ' flag-created ',
            },
            {
                on: 'event',
                name: 'flag-created',
                path: '/projects/:projectId',
                delayMs: 500,
                onOccurrence: 3,
            },
        ],
    ] as const)('triggers on %s', (_, trigger, expected) => {
        const draft: SurveyDraft = {
            ...draftWith([draftQuestion()]),
            trigger: {
                ...initialTriggerDraft(),
                delayMs: '500',
                onOccurrence: '3',
                ...trigger,
            },
        };

        expect(JSON.parse(toSurveyJson(draft)).trigger).toEqual(expected);
        expect(
            parseSurveyPayload('survey-x', delivered(toSurveyJson(draft))),
        ).toMatchObject({ trigger: expected });
    });

    it('leaves out the title and description when the title slide is hidden', () => {
        const draft = {
            ...draftWith([draftQuestion()]),
            showTitleSlide: false,
            description: 'About you',
        };

        expect(JSON.parse(toSurveyJson(draft))).toMatchObject({
            title: null,
            description: null,
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

    it('does not require a title when the title slide is hidden', () => {
        const draft = {
            ...draftWith([draftQuestion()]),
            showTitleSlide: false,
            title: '',
        };

        expect(hasSurveyErrors(validateSurveyDraft(draft))).toBe(false);
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
